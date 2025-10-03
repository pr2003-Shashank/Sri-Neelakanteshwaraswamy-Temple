import React, { FC } from "react";
import BannerBackground from '../assets/temple.jpg'
import { motion } from 'framer-motion'

const Banner: FC = () => {
    return (
        <div className="flex w-full h-[468px] flex-col bg-cover bg-center justify-center items-center"
            style={{ backgroundImage: `url(${BannerBackground.src})` }}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}              // before it appears
                whileInView={{ opacity: 1, y: 0 }}           // when scrolled into view
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}       // play only once, trigger at 30% visibility
                className="flex w-fit flex-col justify-center items-center bg-black/50 backdrop-blur-sm p-4 rounded-xl">
                <h2 className="text-sm md:text-base lg:text-lg text-yellow-100 mb-2">|| ॐ ನಮಃ ಶಿವಾಯ ||</h2>
                <h2 className="text-base md:text-xl lg:text-2xl font-semibold text-yellow-100 mb-2">ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನ</h2>
                <p className="text-base md:text-lg lg:text-xl text-white">ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ</p>
                <p className="text-base md:text-lg lg:text-xl text-white">ಶ್ರೀ ಕ್ಷೇತ್ರ</p>
            </motion.div>
        </div>
    )
}

export default Banner;
