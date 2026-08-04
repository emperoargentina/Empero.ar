// src/components/admin/AdminTourButton.tsx
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/styles/admin-tour.css'
import { getAdminTourSteps, isSidebarTourStep } from '@/lib/adminTour'
import { useSidebar } from '@/components/ui/sidebar'

export function AdminTourButton() {
  const location = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const [showLabel, setShowLabel] = useState(false)
  const driverRef = useRef<Driver | null>(null)

  useEffect(() => {
    return () => { driverRef.current?.destroy() }
  }, [])

  const handleClick = async () => {
    // En mobile el sidebar es un Sheet que ni existe en el DOM hasta que se
    // abre — lo abrimos a mano para poder mostrar esos pasos del recorrido,
    // y lo volvemos a cerrar apenas el tour avanza al resto de la página.
    let sidebarOpenedByTour = false
    if (isMobile) {
      setOpenMobile(true)
      sidebarOpenedByTour = true
      await new Promise(resolve => setTimeout(resolve, 150))
    }

    const steps = getAdminTourSteps(location.pathname)
    if (steps.length === 0) {
      if (sidebarOpenedByTour) setOpenMobile(false)
      return
    }

    driverRef.current?.destroy()
    const driverObj = driver({
      steps,
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: '¡Listo!',
      popoverClass: 'empero-tour-popover',
      overlayColor: '#1a1613',
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 10,
      smoothScroll: true,
      allowClose: true,
      onHighlightStarted: (_element, step) => {
        if (sidebarOpenedByTour && !isSidebarTourStep(step)) {
          sidebarOpenedByTour = false
          setOpenMobile(false)
        }
      },
      onDestroyed: () => {
        if (sidebarOpenedByTour) {
          sidebarOpenedByTour = false
          setOpenMobile(false)
        }
      },
    })
    driverRef.current = driverObj
    driverObj.drive()
  }

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      aria-label="Cómo funciona el panel"
      className="fixed bottom-6 right-6 z-40 flex items-center text-white rounded-full cursor-pointer overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, #C41B2E 0%, #B51426 100%)',
        boxShadow: '0 4px 20px rgba(196,27,46,0.35), 0 1px 4px rgba(0,0,0,0.12)',
        height: '52px',
        paddingLeft: '14px',
        paddingRight: '14px',
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
      whileTap={{ scale: 0.96 }}
    >
      <HelpCircle className="w-5 h-5 flex-shrink-0" />

      <motion.span
        className="text-sm font-semibold whitespace-nowrap overflow-hidden"
        animate={showLabel
          ? { width: 130, marginLeft: 8, opacity: 1 }
          : { width: 0, marginLeft: 0, opacity: 0 }
        }
        initial={{ width: 0, marginLeft: 0, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        ¿Cómo funciona?
      </motion.span>
    </motion.button>
  )
}
