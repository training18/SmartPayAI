"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSavedCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_saved_card_dto_1 = require("./create-saved-card.dto");
class UpdateSavedCardDto extends (0, swagger_1.PartialType)(create_saved_card_dto_1.CreateSavedCardDto) {
}
exports.UpdateSavedCardDto = UpdateSavedCardDto;
//# sourceMappingURL=update-saved-card.dto.js.map