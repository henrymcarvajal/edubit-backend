export const PartnershipMessages = {
  PARTNERSHIP_ALREADY_CONFIRMED: 'Participante ya tiene una sociedad confirmada',
  NOT_MEMBER_OF_MEMBERSHIP: 'No es miembro de esta sociedad para aceptar esta operación',
  PARTNER_CANNOT_PARTNER_WITH_HIMSELF: `Un participante no puede crear una sociedad consigo mismo`,
  PARTNERSHIP_NOT_CONFIRMED: `La sociedad aún no ha sido confirmada`,
  PARTNERSHIP_NON_EXISTENT: `No existe una sociedad para el participante`,
  PARTICIPANT_PROGRESS_NOT_FOUND: (participantId, workshopExecutionId) => `No se encontró progreso de participante: (workshopExecutionId: ${ workshopExecutionId }) (participantId: ${ participantId })`,
  PARTICIPANT_NOT_FOUND: (participantEmail) => `No se encontró al participante con correo ${ participantEmail }`
}