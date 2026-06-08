import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateEmailDto } from './dto/generate-email.dto';

@Controller('campaigns')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('generate')
  generate(@Body() dto: GenerateEmailDto) {
    return this.ai.generateEmail(
      dto.productDescription,
      dto.tone,
      dto.language,
    );
  }
}
