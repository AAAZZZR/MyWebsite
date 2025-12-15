"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

export default function AnimatedBackground() {
  const [init, setInit] = useState(false);

  // 初始化粒子引擎
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden bg-slate-950">
      
      {/* --- 1. 背景光暈氛圍 (Framer Motion) --- */}
      {/* 藍色光暈 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[200px] -right-[200px] w-[800px] h-[800px] rounded-full bg-blue-600 blur-[120px] pointer-events-none"
      />

      {/* 紫色光暈 */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-[200px] -left-[200px] w-[800px] h-[800px] rounded-full bg-purple-600 blur-[120px] pointer-events-none"
      />

      {/* --- 2. 白點聚集互動 (tsParticles) --- */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0"
          options={{
            fullScreen: { enable: false },
            fpsLimit: 120,
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: "grab", // 關鍵：讓滑鼠像磁鐵一樣抓取附近的點
                },
                resize: { enable: true },
              },
              modes: {
                grab: {
                  distance: 180, // 抓取的距離半徑
                  links: {
                    opacity: 1, // 連線變成全白，看起來像閃電/能量聚集
                    color: "#ffffff"
                  },
                },
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.15, // 平常連線很淡，不搶戲
                width: 1,
              },
              move: {
                enable: true,
                speed: 0.8, // 粒子漂浮速度
                direction: "none",
                random: false,
                straight: false,
                outModes: {
                  default: "bounce",
                },
              },
              number: {
                density: {
                  enable: true,
                  // area: 800,
                },
                value: 80, // 粒子數量，可以根據喜好調整
              },
              opacity: {
                value: 0.3, // 點的透明度
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
            background: {
                color: "transparent" // 重要：背景透明，才能看到後面的 Framer Motion 光暈
            }
          }}
        />
      )}
    </div>
  );
}