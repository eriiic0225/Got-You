import { FaChevronDown } from "react-icons/fa6";
import { motion } from "motion/react"

function ScrollDownIndicator(){

  return (
    <motion.div 
      animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <FaChevronDown />
    </motion.div>
  )
}

export default ScrollDownIndicator