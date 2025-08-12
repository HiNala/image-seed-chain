"use client"
import { motion, type HTMLMotionProps } from 'framer-motion'

export function FadeIn(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} {...props} />
  )
}


