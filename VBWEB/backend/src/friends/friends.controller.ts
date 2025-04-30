import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { RequestFriendDto } from './dto/request-friend.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get(':userId')
  getFriends(@Param('userId') userId: string) {
    return this.friendsService.getFriends(userId);
  }

  @Post(':userId/request')
  sendFriendRequest(@Param('userId') senderId: string, @Body() dto: RequestFriendDto) {
    return this.friendsService.sendRequest(senderId, dto.receiverEmail);
  }

  @Put(':userId/respond/:senderId')
  respondRequest(
    @Param('userId') receiverId: string,
    @Param('senderId') senderId: string,
    @Body('accept') accept: boolean
  ) {
    return this.friendsService.respondRequest(senderId, receiverId, accept);
  }
}
