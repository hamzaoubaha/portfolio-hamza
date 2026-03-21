import Portfolio from '../components/sections/Portfolio';
import FeaturedProjects from '../components/sections/FeaturedProjects';
import CaseStudy from '../components/sections/CaseStudy';
import ProjectsHero from '../components/sections/ProjectsHero';
import { motion } from 'framer-motion';

const Projects = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="page-padding"
    >
      <ProjectsHero />
      <Portfolio />
      <FeaturedProjects />
      <CaseStudy />
    </motion.div>
  );
};

export default Projects;

