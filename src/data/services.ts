import type { LucideIcon } from 'lucide-react';
import {
  HelpCircle,
  Search,
  Coins,
  CalendarDays,
  Moon,
  Sparkles,
  Heart,
  Flame,
  Eye,
  Repeat,
} from 'lucide-react';

export type Service = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  details?: string;
  icon: LucideIcon;
};

export type Testimonial = {
  id: string;
  text: string;
  name: string;
};

export const WHATSAPP_NUMBER = '5513996798449';

export function buildWhatsAppLink(
  serviceName: string,
  price: string
): string {
  const message = `Olá! Vim pelo site da ISLP Tarot 🔮 e gostaria de agendar ${serviceName} — ${price}. Poderia me informar os horários disponíveis?`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* =========================================================
   CONSULTAS
========================================================= */

export const consultations: Service[] = [
  {
    id: 'consulta-30',
    name: 'Consulta de 30 minutos',
    price: 'R$ 65',
    priceValue: 65,
    description:
      'Um espaço reservado para explorar suas questões através das cartas com mais liberdade.',
    icon: Sparkles,
  },
  {
    id: 'consulta-60',
    name: 'Consulta de 1 hora',
    price: 'R$ 100',
    priceValue: 100,
    description:
      'Uma experiência mais completa para aprofundar diferentes áreas e questões do seu momento.',
    icon: Sparkles,
  },
];

/* =========================================================
   TIRAGENS
========================================================= */

export const tiragens: Service[] = [
  {
    id: 'pergunta-objetiva',
    name: 'Pergunta Objetiva',
    price: 'R$ 5',
    priceValue: 5,
    description:
      'Uma resposta clara e direta para uma dúvida específica.',
    icon: HelpCircle,
  },
  {
    id: 'pergunta-aprofundada',
    name: 'Pergunta Aprofundada',
    price: 'R$ 10',
    priceValue: 10,
    description:
      'Uma análise mais profunda e detalhada sobre a questão consultada.',
    icon: Search,
  },
  {
    id: 'ferradura-financeira',
    name: 'Ferradura — Vida Financeira',
    price: 'R$ 20',
    priceValue: 20,
    description:
      'Uma leitura sobre seu momento financeiro, bloqueios, influências e caminhos.',
    icon: Coins,
  },
  {
    id: 'tiragem-mensal',
    name: 'Tiragem Mensal',
    price: 'R$ 20',
    priceValue: 20,
    description:
      'Entenda as principais energias, desafios e orientações para o seu mês.',
    icon: CalendarDays,
  },
  {
    id: 'analise-sonhos',
    name: 'Análise dos Sonhos',
    price: 'R$ 25',
    priceValue: 25,
    description:
      'Uma leitura para compreender mensagens, símbolos e possíveis significados dos seus sonhos.',
    icon: Moon,
  },
  {
    id: 'conselho-guias',
    name: 'Conselho dos Guias',
    price: 'R$ 25',
    priceValue: 25,
    description:
      'Orientação espiritual para momentos de dúvidas e decisões importantes.',
    icon: Sparkles,
  },
  {
    id: 'ficar-ou-sair',
    name: 'Ficar ou Sair da Relação?',
    price: 'R$ 25',
    priceValue: 25,
    description:
      'Uma leitura direcionada para quem está em dúvida sobre continuar ou encerrar uma relação.',
    icon: Heart,
  },
  {
    id: 'amantes',
    name: 'Amantes',
    price: 'R$ 30',
    priceValue: 30,
    description:
      'Leitura completa sobre compatibilidade, sentimentos, fidelidade e futuro da relação.',
    icon: Flame,
  },
  {
    id: 'templo-diabo',
    name: 'Templo do Diabo',
    price: 'R$ 30',
    priceValue: 30,
    description:
      'Leitura sobre comportamentos, intenções escondidas e possíveis interferências dentro da relação.',
    icon: Eye,
  },
  {
    id: 'karmica',
    name: 'Kármica',
    price: 'R$ 35',
    priceValue: 35,
    description:
      'Entenda padrões, aprendizados e situações que podem estar se repetindo em sua vida.',
    icon: Repeat,
  },
];

/* =========================================================
   AVALIAÇÕES REAIS
========================================================= */

export const testimonials: Testimonial[] = [
  {
    id: 'avaliacao-1',
    name: 'Cliente',
    text:
      'Oii amg, sobre a consulta, encaixou muito, tinha muita coisa que tipo eu nem te falei mas vc meio que já sabia kkkkkk, e além de tudo explica bem, obrigada viu. Vou seguir os conselhos ❤️',
  },
  {
    id: 'avaliacao-2',
    name: 'Cliente',
    text:
      'Que tiragem incrível!! Muito prestativa em explicar, super atenciosa, e foi impressionante o quanto me ajudou com minhas dúvidas e me fez olhar de uma forma que não tinha olhado antes!! Amei, de verdade.',
  },
  {
    id: 'avaliacao-3',
    name: 'Cliente',
    text:
      'Mulher, bateu demaais, me ajudou demais. Obrigada viu diva ❤️ Juro, tô chocada.',
  },
  {
    id: 'avaliacao-4',
    name: 'Cliente',
    text:
      'Oii, escutei melhor agora a leitura, agradeço pelo atendimento e pela leitura de tarô, foi profunda e certeira, teve clareza nas orientações, o que me ajudou a enxergar o agora. Muito obrigada 🫶✨',
  },
  {
    id: 'avaliacao-5',
    name: 'Cliente',
    text:
      'Isis, quero agradecer por toda disponibilidade nos atendimentos. Agradecer a forma como você aborda os assuntos de forma tão clara e delicada, pela paciência e por todo carinho dispensado em todos os seus atendimentos. Sou imensamente grata a você por toda dedicação e disponibilidade em me atender.',
  },
  {
    id: 'avaliacao-6',
    name: 'Cliente',
    text:
      'Eu amei muito, muito mesmo fazer essa consulta com você! Extremamente profissional e trouxe muita clareza nas minhas dúvidas e direcionamento. São questões bem profundas e você abordou todas com a mesma intensidade da tiragem, trouxe ótimos direcionamentos e conselhos. Bateu muito com a minha real situação e com o que venho passando nesse processo. A tiragem me trouxe bastante clareza. Muito obrigada ❤️🥰',
  },
  {
    id: 'avaliacao-7',
    name: 'Cliente',
    text:
      'As leituras das cartas têm me ajudado muito, em orientações de como tomar atitudes em todos os campos. ❤️',
  },
  {
    id: 'avaliacao-8',
    name: 'Cliente',
    text:
      'Oi Isis!!! Passando pra te agradecer por toda atenção que você me dá! Sempre disposta a jogar o tarô com uma precisão e explicação perfeita! Como eu nunca tinha visto antes!!! Com suas interpretações das cartas, tudo fica muito claro! Sempre deixando claro que tudo se trata de energia e que nada está engessado. Obrigada!!! Já me sinto sua amiga! 😘',
  },
  {
    id: 'avaliacao-9',
    name: 'Cliente',
    text:
      'Eu só confio em sua tiragem kkk. Por isso que jogo só com você.',
  },
  {
    id: 'avaliacao-10',
    name: 'Cliente',
    text:
      'Depois da sua tiragem fiquei tão bem o dia inteiro, dormi tão bem. Sua tiragem, sua voz, seus conhecimentos e sua sabedoria me acalmaram bastante. Desde o dia que minha amiga passou seu contato, só sinto confiança em pedir pra você fazer a tiragem. Gratidão Isis, você conquistou uma cliente fiel agora. ❤️',
  },
  {
    id: 'avaliacao-11',
    name: 'Cliente',
    text:
      'Minha linda, você é super de confiança, tudo que você fala pra mim dá tudo certo. Super recomendo. ❤️',
  },
  {
    id: 'avaliacao-12',
    name: 'Cliente',
    text:
      'Mas tudo fez sentido, é tudo que eu já vivi e que estou vivendo agora. Agora é prestar atenção nos detalhes e tentar seguir o conselho. Obrigada viu... você arrasou ❤️',
  },
];

/* =========================================================
   MENU
========================================================= */

export const menuItems = [
  { label: 'Início', href: 'inicio' },
  { label: 'Consultas', href: 'consultas' },
  { label: 'Tiragens', href: 'tiragens' },
  { label: 'Como funciona', href: 'como-funciona' },
  { label: 'Contato', href: 'contato' },
];
