// src/friends/friends.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FriendsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getFriends(userId: string) {
    const client = this.supabase.client;
  
    // Step 1: Fetch all friendships involving the user
    const { data: friendships, error: fErr } = await client
      .from('friendships')
      .select('*')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
  
    if (fErr) throw fErr;
  
    // Step 2: Extract friend IDs
    const friendIds = friendships.map(f =>
      f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
    );
  
    // Step 3: Fetch user data for all friend IDs
    const { data: users, error: uErr } = await client
      .from('users')
      .select('userid, firstname, lastname, gmail')
      .in('userid', friendIds);
  
    if (uErr) throw uErr;
    return users;
  }

  async sendRequest(senderId: string, receiverEmail: string) {
    const { data: receiver } = await this.supabase.client
      .from('users')
      .select('userid')
      .eq('gmail', receiverEmail)
      .maybeSingle();

    if (!receiver) throw new NotFoundException('User not found');

    const { error } = await this.supabase.client
      .from('friend_requests')
      .insert([{
        sender_id: senderId,
        receiver_id: receiver.userid,
        status: 'pending',
      }]);

    if (error) throw error;

    return { message: 'Friend request sent' };
  }

  async respondRequest(senderId: string, receiverId: string, accept: boolean) {
    const client = this.supabase.client;

    const { error: updateError } = await client
      .from('friend_requests')
      .update({
        status: accept ? 'accepted' : 'rejected',
        responded_at: new Date().toISOString(),
      })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId);

    if (updateError) throw updateError;

    if (accept) {
      const [id1, id2] = [senderId, receiverId].sort();
      const { error: insertError } = await client
        .from('friendships')
        .insert([{ user_id_1: id1, user_id_2: id2 }]);
      if (insertError) throw insertError;
    }

    return { message: `Friend request ${accept ? 'accepted' : 'rejected'}` };
  }
}
