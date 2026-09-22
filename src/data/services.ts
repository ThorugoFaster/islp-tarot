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

export const WHATSAPP_NUMBER = '5513996798449';

export function buildWhatsAppLink(serviceName: string, price: string): string {
  const message = `Olá! Vim pelo site da ISLP Tarot 🔮 e gostaria de agendar ${serviceName} — ${price}. Poderia me informar os horários disponíveis?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const consultations: Service[] = [
  {
    id: 'consulta-30',
    name: 'Consulta de 30 minutos',
    price: 'R$ 65',
    priceValue: 65,
    description: 'Um espaço reservado para explorar suas questões através das cartas com mais liberdade.',
    icon: Sparkles,
  },
  {
    id: 'consulta-60',
    name: 'Consulta de 1 hora',
    price: 'R$ 100',
    priceValue: 100,
    description: 'Uma experiência mais completa para aprofundar diferentes áreas e questões do seu momento.',
    icon: Sparkles,
  },
];

export const tiragens: Service[] = [
  {
    id: 'pergunta-objetiva',
    name: 'Pergunta Objetiva',
    price: 'R$ 5',
    priceValue: 5,
    description: 'Uma resposta clara e direta para uma dúvida específica.',
    icon: HelpCircle,
  },
  {
    id: 'pergunta-aprofundada',
    name: 'Pergunta Aprofundada',
    price: 'R$ 10',
    priceValue: 10,
    description: 'Uma análise mais profunda e detalhada sobre a questão consultada.',
    icon: Search,
  },
  {
    id: 'ferradura-financeira',
    name: 'Ferradura — Vida Financeira',
    price: 'R$ 20',
    priceValue: 20,
    description: 'Uma leitura sobre seu momento financeiro, bloqueios, influências e caminhos.',
    icon: Coins,
  },
  {
    id: 'tiragem-mensal',
    name: 'Tiragem Mensal',
    price: 'R$ 20',
    priceValue: 20,
    description: 'Entenda as principais energias, desafios e orientações para o seu mês.',
    icon: CalendarDays,
  },
  {
    id: 'analise-sonhos',
    name: 'Análise dos Sonhos',
    price: 'R$ 25',
    priceValue: 25,
    description: 'Uma leitura para compreender mensagens, símbolos e possíveis significados dos seus sonhos.',
    icon: Moon,
  },
  {
    id: 'conselho-guias',
    name: 'Conselho dos Guias',
    price: 'R$ 25',
    priceValue: 25,
    description: 'Orientação espiritual para momentos de dúvidas e decisões importantes.',
    icon: Sparkles,
  },
  {
    id: 'ficar-ou-sair',
    name: 'Ficar ou Sair da Relação?',
    price: 'R$ 25',
    priceValue: 25,
    description: 'Uma leitura direcionada para quem está em dúvida sobre continuar ou encerrar uma relação.',
    icon: Heart,
  },
  {
    id: 'amantes',
    name: 'Amantes',
    price: 'R$ 30',
    priceValue: 30,
    description: 'Leitura completa sobre compatibilidade, sentimentos, fidelidade e futuro da relação.',
    icon: Flame,
  },
  {
    id: 'templo-diabo',
    name: 'Templo do Diabo',
    price: 'R$ 30',
    priceValue: 30,
    description: 'Leitura sobre comportamentos, intenções escondidas e possíveis interferências dentro da relação.',
    icon: Eye,
  },
  {
    id: 'karmica',
    name: 'Kármica',
    price: 'R$ 35',
    priceValue: 35,
    description: 'Entenda padrões, aprendizados e situações que podem estar se repetindo em sua vida.',
    icon: Repeat,
  },
];

export const menuItems = [
  { label: 'Início', href: 'inicio' },
  { label: 'Consultas', href: 'consultas' },
  { label: 'Tiragens', href: 'tiragens' },
  { label: 'Como funciona', href: 'como-funciona' },
  { label: 'Contato', href: 'contato' },
];
