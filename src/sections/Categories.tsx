import {
  Droplets,
  Snowflake,
  Store,
  Flame,
  Grid3X3,
  ChefHat,
  FlameKindling,
  Utensils,
  Table2,
  Cog,
  Table,
  ArrowRight
} from 'lucide-react';
import { categories } from '@/data/products';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  Droplets,
  Snowflake,
  Store,
  Flame,
  Grid3X3,
  ChefHat,
  FlameKindling,
  Utensils,
  Table2,
  Cog,
  Table,
};

interface CategoriesProps {
  onCategorySelect: (categoryId: string) => void;
}

export function Categories({ onCategorySelect }: CategoriesProps) {
  return (
    <section className="section-padding bg-gray-50/60">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedSection direction="up">
            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Nuestro Catálogo
            </span>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Explora por categoría
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2}>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
              Encuentra el equipamiento perfecto para tu negocio. Contamos con más de 784 productos
              distribuidos en {categories.length} categorías principales.
            </p>
          </AnimatedSection>
        </div>

        {/* Categories Grid */}
        <StaggerContainer
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          staggerDelay={0.06}
        >
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || ChefHat;

            return (
              <StaggerItem key={category.id}>
                <motion.button
                  onClick={() => onCategorySelect(category.id)}
                  className="group w-full bg-white rounded-2xl p-5 text-left border transition-colors duration-200"
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                  whileHover={{
                    y: -6,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
                    borderColor: 'rgba(211,47,47,0.2)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* Icon */}
                  <motion.div
                    className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4"
                    whileHover={{ backgroundColor: '#d32f2f' }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-5 h-5 text-[#d32f2f] group-hover:text-white transition-colors duration-200" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#d32f2f] transition-colors duration-200 leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {category.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 text-xs text-[#d32f2f] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span>Ver todos</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </motion.button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
