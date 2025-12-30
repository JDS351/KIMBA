
import React from 'react';
import { Course } from '../types';
import { Icons } from '../constants';

const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Marketing Digital para Startups Angolanas',
    instructor: 'João Carlos',
    description: 'Aprenda estratégias reais para o mercado local com foco em impacto.',
    price: 5000,
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/course1/800/600',
    verified: true
  },
  {
    id: 'c2',
    title: 'Introdução à Programação com Python',
    instructor: 'Maria Santos',
    description: 'Curso completo para iniciantes, do zero ao primeiro projeto.',
    price: 'Gratuito',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/course2/800/600',
    verified: true
  }
];

interface ContentsProps {
  formatPrice: (p: number) => string;
}

const Contents: React.FC<ContentsProps> = ({ formatPrice }) => {
  return (
    <div className="py-6 space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-[0.1em] uppercase">Curadoria</h2>
        <button className="text-[9px] font-black text-[#E41B17] tracking-[0.2em] uppercase">
          Explorar
        </button>
      </div>

      <section className="space-y-6">
        <div className="grid gap-8">
          {MOCK_COURSES.map(course => (
            <div 
              key={course.id}
              className="group cursor-pointer space-y-4"
            >
              <div className="relative aspect-[21/9] overflow-hidden rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-900">
                <img 
                  src={course.imageUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-[#E41B17] uppercase tracking-widest shadow-sm">
                   {typeof course.price === 'number' ? formatPrice(course.price) : course.price}
                </div>
              </div>
              <div className="px-2 space-y-1">
                <div className="flex items-center space-x-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{course.instructor}</span>
                  {course.verified && <div className="w-1 h-1 bg-[#FFCC00] rounded-full" />}
                </div>
                <h4 className="font-bold text-lg leading-tight transition-colors group-hover:text-[#E41B17]">
                  {course.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="p-10 bg-black dark:bg-white rounded-[2.5rem] text-white dark:text-black space-y-6 text-center shadow-2xl">
        <h3 className="text-2xl font-bold tracking-tighter leading-none">
          CONTRIBUA COM O MOVIMENTO
        </h3>
        <p className="text-xs opacity-60 max-w-xs mx-auto font-medium">
          Partilhe o seu domínio técnico com a comunidade KIMBA e monetize o seu conhecimento.
        </p>
        <button className="w-full bg-[#E41B17] text-white font-black py-4 rounded-full text-[10px] tracking-widest uppercase shadow-xl active:scale-95 transition-all">
          PUBLICAR CONTEÚDO
        </button>
      </div>
    </div>
  );
};

export default Contents;
