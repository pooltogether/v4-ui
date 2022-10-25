import { AnimatePresence, motion, MotionStyle, useReducedMotion } from 'framer-motion'

export const FadeInDiv = (props: {
  id: string
  children: React.ReactNode
  style?: MotionStyle
  className?: string
}) => {
  const { id, className, style, children } = props
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      <motion.div
        key={id}
        transition={{ duration: shouldReduceMotion ? 0 : 0.1, ease: 'easeIn' }}
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
