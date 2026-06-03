import { motion } from 'framer-motion';
import { FiAward, FiHeart, FiTarget } from 'react-icons/fi';
import { SEOHead } from '@/components/seo/SEOHead';

const About = () => (
  <>
    <SEOHead
      title="About Us | CVR Handicrafts"
      description="Learn about CVR Handicrafts - our story, mission, and commitment to preserving traditional Indian craftsmanship."
    />

    <section className="bg-espresso py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-sm uppercase tracking-[0.3em] font-semibold mb-3">Our Story</p>
        <h1 className="font-heading text-3xl lg:text-4xl text-white">About CVR Handicrafts</h1>
      </div>
    </section>

    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-wood/20 to-gold/10 flex items-center justify-center"
          >
            <div className="text-center p-8">
              <p className="font-heading text-5xl text-wood/30">✦</p>
              <p className="font-heading text-lg text-wood/40 mt-4">Our Workshop</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-wood-light text-sm uppercase tracking-[0.3em] font-semibold mb-3">Heritage & Craft</p>
            <h2 className="font-heading text-3xl font-bold text-espresso mb-6">Preserving Tradition, Crafting Excellence</h2>
            <div className="space-y-4 text-wood-light leading-relaxed">
              <p>CVR Handicrafts is a premium artisan brand dedicated to preserving and promoting India's rich tradition of handcraftsmanship. Founded with a passion for wooden artistry and brass sculpting, we bring the finest handcrafted products to homes across India.</p>
              <p>Every piece in our collection is handcrafted by skilled artisans who have inherited techniques passed down through generations. From exquisite wooden furniture to sacred brass idols, each product reflects the dedication and mastery of traditional craftsmanship.</p>
              <p>We source the finest raw materials and employ time-honored techniques to create pieces that are not just products, but works of art that tell stories of heritage, devotion, and artistic excellence.</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { icon: FiTarget, title: 'Our Mission', desc: 'To make premium handcrafted products accessible while supporting artisan communities and preserving traditional craft techniques.' },
            { icon: FiHeart, title: 'Our Values', desc: 'Quality craftsmanship, sustainable practices, fair artisan wages, and authentic traditional techniques in every product we create.' },
            { icon: FiAward, title: 'Our Vision', desc: 'To be India\'s leading luxury handicrafts brand, connecting artisans with discerning customers who appreciate fine craftsmanship.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white p-8 rounded-lg border border-wood/5 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <item.icon className="text-gold" size={24} />
              </div>
              <h3 className="font-heading text-xl font-semibold text-espresso mb-3">{item.title}</h3>
              <p className="text-sm text-wood-light leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default About;
