import type { Conversation } from '../types/chat'

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Идеи для лендинга',
    updatedAt: '2026-10-09T14:30:00Z',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Предложи структуру hero-блока для SaaS',
        createdAt: '2026-10-09T14:20:00Z',
        status: 'sent',
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'Для SaaS hero обычно включает: заголовок с выгодой, подзаголовок, CTA «Попробовать бесплатно», скрин продукта и 3 буллета доверия (клиенты, рейтинг, без карты).',
        createdAt: '2026-10-09T14:21:00Z',
        status: 'sent',
      },
      {
        id: 'm3',
        role: 'user',
        content: 'А какой тон текста лучше — формальный или дружелюбный?',
        createdAt: '2026-10-09T14:25:00Z',
        status: 'sent',
      },
      {
        id: 'm4',
        role: 'assistant',
        content:
          'Для B2B чаще умеренно-деловой тон с «вы» на «ты» только если аудитория стартапы. Добавьте конкретику: цифры экономии времени вместо общих слов.',
        createdAt: '2026-10-09T14:26:00Z',
        status: 'sent',
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Подключение виджета',
    updatedAt: '2026-10-08T11:15:00Z',
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'Как встроить чат на сайт?',
        createdAt: '2026-10-08T11:00:00Z',
        status: 'sent',
      },
      {
        id: 'm6',
        role: 'assistant',
        content:
          'Скопируйте скрипт из кабинета и вставьте перед закрывающим </body>. Виджет появится в правом нижнем углу. Проверьте, что домен добавлен в настройках.',
        createdAt: '2026-10-08T11:01:00Z',
        status: 'sent',
      },
      {
        id: 'm7',
        role: 'user',
        content: 'Можно ли скрыть на мобильных?',
        createdAt: '2026-10-08T11:05:00Z',
        status: 'sent',
      },
      {
        id: 'm8',
        role: 'assistant',
        content:
          'Да, в настройках отображения задайте правило «скрыть на экранах < 768px» или используйте свой CSS-класс на контейнере.',
        createdAt: '2026-10-08T11:06:00Z',
        status: 'sent',
      },
      {
        id: 'm9',
        role: 'user',
        content: 'Спасибо, всё получилось!',
        createdAt: '2026-10-08T11:14:00Z',
        status: 'sent',
      },
      {
        id: 'm10',
        role: 'assistant',
        content: 'Отлично! Если появятся вопросы по аналитике диалогов — напишите.',
        createdAt: '2026-10-08T11:15:00Z',
        status: 'sent',
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Тарифы и оплата',
    updatedAt: '2026-10-07T09:45:00Z',
    messages: [
      {
        id: 'm11',
        role: 'user',
        content: 'Есть ли годовая скидка?',
        createdAt: '2026-10-07T09:30:00Z',
        status: 'sent',
      },
      {
        id: 'm12',
        role: 'assistant',
        content:
          'При оплате за год действует скидка 20% относительно помесячного тарифа. Счёт выставим на юрлицо или физлицо.',
        createdAt: '2026-10-07T09:31:00Z',
        status: 'sent',
      },
      {
        id: 'm13',
        role: 'user',
        content: 'Сколько операторов в тарифе «Бизнес»?',
        createdAt: '2026-10-07T09:40:00Z',
        status: 'sent',
      },
      {
        id: 'm14',
        role: 'assistant',
        content:
          'В «Бизнес» до 10 операторов, неограниченные чаты и интеграция с CRM. Можно докупить места пакетами по 5.',
        createdAt: '2026-10-07T09:45:00Z',
        status: 'sent',
      },
    ],
  },
]

export function getConversationById(id: string): Conversation | undefined {
  return mockConversations.find((c) => c.id === id)
}
