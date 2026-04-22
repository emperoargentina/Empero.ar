// =============================================================================
// Manufactura Section - Rediseñado con estilo senior premium
// =============================================================================

import { 
  Factory, 
  Shield, 
  Award, 
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Gem
} from 'lucide-react';
import { companyConfig } from '@/data/company';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

export function Manufactura() {
  const processSteps = [
    {
      icon: Sparkles,
      title: 'Diseño',
      description: 'Ingenieros especializados diseñan cada producto pensando en la funcionalidad y durabilidad que el sector gastronómico exige.',
    },
    {
      icon: Factory,
      title: 'Fabricación',
      description: 'Procesos de manufactura con maquinaria de última generación y control de calidad en cada etapa del proceso.',
    },
    {
      icon: TrendingUp,
      title: 'Ensamblaje',
      description: 'Montaje preciso por técnicos certificados con años de experiencia en el rubro gastronómico industrial.',
    },
    {
      icon: Shield,
      title: 'Control de Calidad',
      description: 'Cada producto pasa por rigurosas pruebas antes de salir de nuestra planta productiva.',
    },
  ];

  const features = [
    { icon: Gem, text: 'Materiales de primera calidad' },
    { icon: Sparkles, text: 'Acabados profesionales' },
    { icon: Zap, text: 'Tecnología de vanguardia' },
    { icon: Shield, text: 'Garantía extendida' },
  ];

  return (
    <section id="manufactura" className="py-20 lg:py-28 bg-gray-50/50 overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <AnimatedSection direction="up">
            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Nuestro Proceso
            </span>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Manufactura de <span className="text-[#d32f2f]">Excelencia</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2}>
            <p className="text-gray-500 mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
              {companyConfig.description}
            </p>
          </AnimatedSection>
        </div>

        {/* Process Steps */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20 lg:mb-24" staggerDelay={0.12}>
          {processSteps.map((step, index) => (
            <StaggerItem key={step.title}>
              <motion.div 
                className="relative group h-full"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {/* Step Number */}
                <div className="absolute -top-3 left-5 w-8 h-8 bg-[#d32f2f] text-white rounded-lg flex items-center justify-center text-sm font-bold z-10 shadow-lg shadow-red-500/20">
                  {index + 1}
                </div>
                
                <div className="card-premium rounded-2xl p-7 pt-8 h-full bg-white">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl flex items-center justify-center mb-5 group-hover:from-red-100 group-hover:to-red-200/50 transition-all duration-300">
                    <step.icon className="w-5 h-5 text-[#d32f2f]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-5 mb-20">
          <AnimatedSection direction="left" delay={0}>
            <motion.div 
              className="card-premium rounded-2xl p-8 lg:p-10 bg-white h-full"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-[#d32f2f]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nuestra Misión</h3>
              <p className="text-gray-500 leading-relaxed">
                {companyConfig.mission}
              </p>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.15}>
            <motion.div 
              className="card-premium rounded-2xl p-8 lg:p-10 bg-white h-full"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-[#d32f2f]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nuestra Visión</h3>
              <p className="text-gray-500 leading-relaxed">
                {companyConfig.vision}
              </p>
            </motion.div>
          </AnimatedSection>
        </div>

        {/* Features Banner */}
        <AnimatedSection direction="up" delay={0}>
          <motion.div 
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 lg:p-14 relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d32f2f]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#d32f2f]/5 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
                ¿Por qué elegir <span className="text-red-400">{companyConfig.name}</span>?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {features.map((feature, index) => (
                  <motion.div 
                    key={feature.text} 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <motion.div 
                      className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5"
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <feature.icon className="w-6 h-6 text-red-400" />
                    </motion.div>
                    <p className="text-white/90 font-medium text-sm">{feature.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Values */}
        <div className="mt-16 lg:mt-20">
          <AnimatedSection direction="up">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
              Nuestros Valores
            </h3>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" staggerDelay={0.08}>
            {companyConfig.values.map((value) => (
              <StaggerItem key={value}>
                <motion.div 
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100/80 shadow-sm"
                  whileHover={{ 
                    borderColor: 'rgba(211, 47, 47, 0.2)',
                    y: -2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#d32f2f]" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{value}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Stats Row */}
        <AnimatedSection direction="up" delay={0.2} className="mt-16 lg:mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: companyConfig.stats.years, label: 'Años de experiencia', icon: Award },
              { value: companyConfig.stats.products, label: 'Productos', icon: Zap },
              { value: companyConfig.stats.clients, label: 'Clientes', icon: Users },
              { value: '100%', label: 'Compromiso', icon: Shield },
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                className="text-center p-6 bg-white rounded-2xl border border-gray-100/80"
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <stat.icon className="w-5 h-5 text-[#d32f2f] mx-auto mb-3 opacity-60" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
