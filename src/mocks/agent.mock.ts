import type { AgentProfile } from '../types/chat'
import { workshopPhone } from '../config/shop'

export const mockAgent: AgentProfile = {
  id: 'agent-1',
  name: 'Айша',
  title: 'Консультант автотоваров',
  initials: 'А',
  accentColor: '#2dbd8f',
  status: 'online',
  greeting: `Здравствуйте! Помогу подобрать масла, фильтры, аккумуляторы и другие товары для вашего авто. По ремонту и другим вопросам — звоните в автомастерскую: ${workshopPhone}.`,
}
