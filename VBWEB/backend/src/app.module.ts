// src/app.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { VenuesModule } from './venues/venues.module';
// import { CourtModule } from './court/court.module';
import { ReserveModule } from './reserve/reserve.module';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { MaintainerApplicationsModule } from './maintainer-applications/maintainer-applications.module';
import { AdminReviewModule } from './admin-review/admin-review.module';
import { CourtModule } from './court/court.module';
import { CourtReservationsModule } from './court-reservations/court-reservations.module';
import { ReservationJoinRequestsModule } from './reservation-join-requests/reservation-join-requests.module';
import { CustomReservationsModule } from './custom-reservations/custom-reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    UserModule,
    VenuesModule,
    CourtModule,
    ReserveModule,
    ChatModule,
    FriendsModule,
    MaintainerApplicationsModule,
    AdminReviewModule,
    CourtModule,
    CourtReservationsModule,
    ReservationJoinRequestsModule,
    CustomReservationsModule,
  ]
})
export class AppModule {}
