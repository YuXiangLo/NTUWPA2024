// src/maintainer-applications/maintainer-applications.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  Request,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMaintainerApplicationDto } from './dto/create-maintainer-application.dto';
import { MaintainerApplicationsService } from './maintainer-applications.service';

@Controller('maintainer_applications')    // was 'api/maintainer_applications'
@UseGuards(JwtAuthGuard)
export class MaintainerApplicationsController {
  constructor(
    private readonly service: MaintainerApplicationsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } }
    ),
  )
  async create(
    @UploadedFiles() files: { image1?: Express.Multer.File[]; image2?: Express.Multer.File[] } = {},
    @Body() dto: CreateMaintainerApplicationDto,
    @Request() req,
  ) {
    const userId = req.user?.userid;
    const result = await this.service.create(dto, userId, files);
    return {
      id: result.id,
      status: result.status,
      submitted_at: result.submitted_at,
    };
  }
}
