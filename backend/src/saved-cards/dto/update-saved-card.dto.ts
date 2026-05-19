import { PartialType } from '@nestjs/swagger';
import { CreateSavedCardDto } from './create-saved-card.dto';

export class UpdateSavedCardDto extends PartialType(CreateSavedCardDto) {}
