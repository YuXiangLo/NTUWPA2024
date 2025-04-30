import { IsEmail } from 'class-validator';

export class RequestFriendDto {
  @IsEmail()
  receiverEmail: string;
}
