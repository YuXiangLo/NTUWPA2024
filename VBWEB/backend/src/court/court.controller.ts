import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CourtService } from './court.service';
import { CreateOpeningHourDto } from './dto/create-opening-hour.dto';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';

@Controller('venues/:venueId/courts/:courtId/opening-hours')
@UseGuards(JwtAuthGuard)
export class CourtController {
  constructor(private readonly service: CourtService) {}

  @Get()
  getAll(
    @Param('courtId') courtId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userid;
    return this.service.getOpeningHours(courtId, userId);
  }

  @Post()
  create(
    @Param('courtId') courtId: string,
    @Body() dto: CreateOpeningHourDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userid;
    return this.service.createOpeningHour(courtId, userId, dto);
  }

  @Patch(':ohId')
  update(
    @Param('courtId') courtId: string,
    @Param('ohId') ohId: string,
    @Body() dto: UpdateOpeningHourDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userid;
    return this.service.updateOpeningHour(courtId, ohId, userId, dto);
  }

  @Delete(':ohId')
  remove(
    @Param('courtId') courtId: string,
    @Param('ohId') ohId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userid;
    return this.service.deleteOpeningHour(courtId, ohId, userId);
  }
}
