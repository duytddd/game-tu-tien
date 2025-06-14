// src/hooks/use-game-canvas.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from './use-game-state';
import { useAuth } from './use-auth';
import { loadImage } from '@/lib/utils';
// Đảm bảo collection và onSnapshot được import
import { collection, onSnapshot } from 'firebase/firestore'; // getFirestore không cần thiết nếu db đã export
import { db } from '@/lib/firebase/firebase'; // Import db từ firebase.ts

interface PlayerSprite {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  spriteSheet: HTMLImageElement | null;
  frameWidth: number;
  currentState: 'idle' | 'moving' | 'attack';
  currentFrame: number;
  lastFrameTime: number;
  animationSpeed: number;
  animations: {
    [key: string]: { startFrame: number; endFrame: number; loop: boolean; };
  };
}

interface TargetSprite {
  x: number;
  y: number;
  width: number;
  height: number;
  isHit: boolean;
  hitDuration: number;
  image: HTMLImageElement | null; // target.image chỉ dùng cho mục tiêu
}

interface Projectile {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  skillId: string;
  damageDealt?: number;
  expGained?: number;
}

const assets: {
  playerIdle: HTMLImageElement | null;
  playerAttack: HTMLImageElement | null;
  projectile: HTMLImageElement | null;
  hoaLien: HTMLImageElement | null;
  explosion: HTMLImageElement | null;
  arenaBackground: HTMLImageElement | null;
  clans: Record<string, HTMLImageElement>; // Nơi lưu trữ tất cả ảnh clan
  clansHit: Record<string, HTMLImageElement>;
  formations: Record<string, HTMLImageElement>;
  titles: Record<string, HTMLImageElement>;
  userAvatars: Record<string, { character: HTMLImageElement | null; clan: HTMLImageElement | null; clanHit: HTMLImageElement | null }>;
} = {
  playerIdle: null,
  playerAttack: null,
  projectile: null,
  hoaLien: null,
  explosion: null,
  arenaBackground: null,
  clans: {},
  clansHit: {},
  formations: {},
  titles: {},
  userAvatars: {},
};

const player: PlayerSprite = {
  x: 150,
  y: 300,
  width: 150,
  height: 150,
  speed: 4,
  spriteSheet: null,
  frameWidth: 1024,
  currentState: 'idle',
  currentFrame: 0,
  lastFrameTime: 0,
  animationSpeed: 150,
  animations: {
    'idle': { startFrame: 0, endFrame: 2, loop: true },
    'moving': { startFrame: 3, endFrame: 4, loop: true },
    'attack': { startFrame: 5, endFrame: 7, loop: false }
  }
};

const target: TargetSprite = { // target này chỉ là hitbox và giữ ảnh của mục tiêu hiện tại
  x: 0,
  y: 0,
  width: 250,
  height: 250,
  isHit: false,
  hitDuration: 200,
  image: null // target.image sẽ được cập nhật trong gameLoop hoặc selectTarget
};

const projectiles: Projectile[] = [];
const activeEffects: any[] = [];
const skillCooldowns: Record<string, number> = { normal_attack: 0, hoa_lien: 0 };


function getClanImageUrl(clanData: any) {
    if (!clanData || !clanData.level) return "/images/castle-lv1.png";
    const extension = clanData.level > 1 ? "gif" : "png";
    return `/images/castle-lv${clanData.level}.${extension}`;
}

function getClanHitImageUrl(clanData: any) {
    if (!clanData || !clanData.level) return "/images/castle-lv1-hit.png";
    const extension = clanData.level > 1 ? "gif" : "png";
    return `/images/castle-lv${clanData.level}-hit.${extension}`;
}

function getFormationImageUrl(formationLevel: number) {
    if (!formationLevel || formationLevel <= 0) return null;
    return `/images/formation-lv${formationLevel}.png`;
}

function createImpactEffect(ctx: CanvasRenderingContext2D, x: number, y: number) {
  if (!assets.explosion) return;
  activeEffects.push({
    x: x - assets.explosion.width / 2,
    y: y - assets.explosion.height / 2,
    image: assets.explosion,
    life: 300,
    totalLife: 300,
  });
}

function drawTargetInfo(ctx: CanvasRenderingContext2D, targetData: any, targetRect: {x: number, y: number, width: number, height: number}) {
  if (!targetData || !targetRect) return;
  const { x, y, width } = targetRect;
  const { name, level, hp, maxHp, formationLevel, formationShield, maxFormationShield } = targetData;

  ctx.font = 'bold 20px "Eczar"';
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  const text = `${name} (Cấp ${level || 1})`;
  ctx.strokeText(text, x + width / 2, y - 15);
  ctx.fillText(text, x + width / 2, y - 15);

  let barY = y + targetRect.height + 15;

  if (formationLevel && formationLevel > 0) {
    const shieldPercentage = Math.max(0, (formationShield || 0) / (maxFormationShield || 1));
    ctx.fillStyle = "#333";
    ctx.fillRect(x, barY, width, 15);
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(x, barY, width * shieldPercentage, 15);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, barY, width, 15);
    ctx.font = 'bold 14px "Eczar"';
    ctx.fillStyle = "white";
    ctx.strokeText(
      `Đại Trận Lv${formationLevel}: ${formationShield || 0}/${maxFormationShield || 0}`,
      x + width / 2,
      barY + 12,
    );
    ctx.fillText(
      `Đại Trận Lv${formationLevel}: ${formationShield || 0}/${maxFormationShield || 0}`,
      x + width / 2,
      barY + 12,
    );
    barY += 25;
  }

  const hpPercentage = Math.max(0, hp / maxHp);
  ctx.fillStyle = "#333";
  ctx.fillRect(x, barY, width, 20);
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(x, barY, width * hpPercentage, 20);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, barY, width, 20);
  ctx.font = 'bold 16px "Eczar"';
  ctx.fillStyle = "white";
  ctx.strokeText(`${hp.toLocaleString()} / ${maxHp.toLocaleString()}`, x + width / 2, barY + 16);
  ctx.fillText(`${hp.toLocaleString()} / ${maxHp.toLocaleString()}`, x + width / 2, barY + 16);
}


export function useGameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const movementState = useRef({ up: false, down: false, left: false, right: false });

  const { currentTargetId, currentTargetData, clans, userData } = useGameState();

  const setPlayerAnimation = useCallback((stateName: 'idle' | 'moving' | 'attack') => {
    if (player.currentState === stateName) return;
    const newAnimation = player.animations[stateName];
    if (newAnimation) {
      player.currentState = stateName;
      player.currentFrame = newAnimation.startFrame;
    }
  }, []);

  const updatePlayerPosition = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMoving = false;
    if (movementState.current.up) {
      player.y = Math.max(120, player.y - player.speed);
      isMoving = true;
    }
    if (movementState.current.down) {
      player.y = Math.min(canvas.height - player.height, player.y + player.speed);
      isMoving = true;
    }
    if (movementState.current.left) {
      player.x = Math.max(0, player.x - player.speed);
      isMoving = true;
    }
    if (movementState.current.right) {
      let rightBoundary = canvas.width - player.width;
      if (currentTargetId && target.x > 0) {
        const castleSafeZone = 50;
        rightBoundary = target.x - player.width - castleSafeZone;
      }
      player.x = Math.min(rightBoundary, player.x + player.speed);
      isMoving = true;
    }

    if (player.currentState !== 'attack') {
      if (isMoving) {
        setPlayerAnimation('moving');
      } else {
        setPlayerAnimation('idle');
      }
    }
  }, [currentTargetId, setPlayerAnimation]);

  const fireProjectile = useCallback(() => {
    setPlayerAnimation('attack');
    projectiles.push({
      x: player.x + player.width,
      y: player.y + player.height / 2,
      width: 40,
      height: 20,
      speed: 20,
      skillId: 'normal_attack',
    });
  }, [setPlayerAnimation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadInitialAssets = async () => {
        try {
            player.spriteSheet = await loadImage('/images/player-spritesheet.png');
            assets.projectile = await loadImage('/images/projectile.png');
            assets.hoaLien = await loadImage('/images/hoa_lien.png');
            assets.explosion = await loadImage('/images/explosion.png');
        } catch (error) {
            console.error("Lỗi tải tài nguyên game:", error);
        }
    };
    loadInitialAssets(); // Call the initial asset loading

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      player.x = 50;
      player.y = canvas.height / 2;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const gameLoop = () => {
      const now = Date.now();
      const frameTime = 1000 / 60;

      updatePlayerPosition();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (player.spriteSheet) {
        const currentAnimation = player.animations[player.currentState];
        if (now - player.lastFrameTime > player.animationSpeed) {
          player.currentFrame++;
          player.lastFrameTime = now;
        }
        if (player.currentFrame > currentAnimation.endFrame) {
          if (currentAnimation.loop) {
            player.currentFrame = currentAnimation.startFrame;
          } else {
            setPlayerAnimation('idle');
          }
        }
        const sourceX = player.currentFrame * player.frameWidth;
        ctx.drawImage(
          player.spriteSheet,
          sourceX, 0,
          player.frameWidth, player.frameWidth,
          player.x, player.y,
          player.width, player.height
        );
      }

      // --- Vẽ mục tiêu (Tông Môn địch) HOẶC Tông Môn của mình ---
      if (currentTargetId && currentTargetData) { // Nếu có mục tiêu tấn công
        const img = assets.clansHit[currentTargetId] && target.isHit ? assets.clansHit[currentTargetId] : assets.clans[currentTargetId];
        if (img) {
          target.x = canvas.width - target.width - 150;
          target.y = canvas.height / 2 - target.height / 2;
          ctx.drawImage(img, target.x, target.y, target.width, target.height);
          if (currentTargetData.formationLevel && currentTargetData.formationLevel > 0 && assets.formations[currentTargetId]) {
            const formationImage = assets.formations[currentTargetId];
            const formationWidth = target.width * 1.5;
            const formationHeight = target.height * 1.5;
            const formationX = target.x - (formationWidth - target.width) / 2;
            const formationY = target.y - (formationHeight - target.height) / 2;
            ctx.drawImage(formationImage, formationX, formationY, formationWidth, formationHeight);
          }
          drawTargetInfo(ctx, currentTargetData, target);
        }
      } else if (userData?.clanId) { // Nếu không có mục tiêu, nhưng người chơi có tông môn riêng
        const myClanData = clans[userData.clanId];
        const myClanImage = assets.clans[userData.clanId]; // Lấy ảnh từ assets

        console.log("DEBUG: Vẽ Tông Môn Của Mình");
        console.log("  1. userData.clanId:", userData.clanId); // Kiểm tra clanId
        console.log("  2. myClanData (from clans state):", myClanData); // Kiểm tra dữ liệu clan
        console.log("  3. myClanImage (from assets.clans):", myClanImage); // Kiểm tra ảnh đã tải

        if (myClanData && myClanImage && userData.clanId === myClanData.id) { // Đảm bảo myClanData khớp với userData.clanId
          const myClanDisplayRect = { x: 50, y: canvas.height / 2 - 125, width: 250, height: 250 };
          ctx.drawImage(myClanImage, myClanDisplayRect.x, myClanDisplayRect.y, myClanDisplayRect.width, myClanDisplayRect.height);
          // Vẽ đại trận nếu có
          if (myClanData.formationLevel && myClanData.formationLevel > 0 && assets.formations[myClanData.id]) {
            const formationImage = assets.formations[myClanData.id];
            const formationWidth = myClanDisplayRect.width * 1.5;
            const formationHeight = myClanDisplayRect.height * 1.5;
            const formationX = myClanDisplayRect.x - (formationWidth - myClanDisplayRect.width) / 2;
            const formationY = myClanDisplayRect.y - (formationHeight - myClanDisplayRect.height) / 2;
            ctx.drawImage(formationImage, formationX, formationY, formationWidth, formationHeight);
          }
          drawTargetInfo(ctx, myClanData, myClanDisplayRect);
        } else {
            console.warn("DEBUG: KHÔNG THỂ VẼ TÔNG MÔN CỦA MÌNH: Dữ liệu clan hoặc ảnh bị thiếu/không khớp.", {
                clanIdFromUserData: userData.clanId, // Log clanId từ userData
                myClanDataLoaded: !!myClanData, // true nếu có dữ liệu clan
                myClanImageLoaded: !!myClanImage, // true nếu ảnh đã tải vào assets
                isClanIdMatching: myClanData ? (userData.clanId === myClanData.id) : false // Kiểm tra khớp ID
            });
        }
      } else {
          console.log("DEBUG: Không có mục tiêu tấn công và người chơi chưa gia nhập tông môn (hoặc clanId = null).");
          console.log("  userData.clanId:", userData?.clanId);
      }


      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.speed;
        const projectileImage = p.skillId === "hoa_lien" ? assets.hoaLien : assets.projectile;
        if (projectileImage) ctx.drawImage(projectileImage, p.x, p.y, p.width, p.height);

        if (currentTargetId && target.image && p.x + p.width > target.x && p.y > target.y && p.y < target.y + target.height) {
          createImpactEffect(ctx, p.x + p.width, p.y + p.height / 2);
          projectiles.splice(i, 1);
        } else if (p.x > canvas.width) {
          projectiles.splice(i, 1);
        }
      }

      for (let i = activeEffects.length - 1; i >= 0; i--) {
        const effect = activeEffects[i];
        ctx.globalAlpha = effect.life / effect.totalLife;
        ctx.drawImage(effect.image, effect.x, effect.y);
        ctx.globalAlpha = 1.0;
        effect.life -= frameTime;
        if (effect.life <= 0) {
          activeEffects.splice(i, 1);
        }
      }

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updatePlayerPosition, setPlayerAnimation, currentTargetId, currentTargetData, clans, userData]);

  // Hook để lắng nghe thay đổi của các clan (để cập nhật ảnh clan)
  useEffect(() => {
    if (!db) {
        console.error("Firestore DB chưa được khởi tạo!");
        return;
    }
    const clanCollectionRef = collection(db, 'clans');
    const unsubscribe = onSnapshot(clanCollectionRef, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const clanId = change.doc.id;
        const clanData = change.doc.data(); // Dữ liệu thô từ Firestore

        if (change.type === 'added' || change.type === 'modified') {
          try {
            // Tải ảnh cơ bản của clan
            const imageUrl = getClanImageUrl(clanData);
            const loadedImage = await loadImage(imageUrl);
            assets.clans[clanId] = loadedImage; // Gán ảnh đã tải vào assets.clans

            // Tải ảnh hit của clan (nếu có)
            const hitImageUrl = getClanHitImageUrl(clanData);
            const loadedHitImage = await loadImage(hitImageUrl);
            assets.clansHit[clanId] = loadedHitImage;

            // Tải ảnh đại trận nếu có
            if (clanData.formationLevel && clanData.formationLevel > 0) {
              const formationImageUrl = getFormationImageUrl(clanData.formationLevel);
              if (formationImageUrl) {
                const loadedFormationImage = await loadImage(formationImageUrl);
                assets.formations[clanId] = loadedFormationImage;
              }
            }

            // Cập nhật target.image chỉ khi đây là mục tiêu đang chọn
            if (currentTargetId === clanId) {
                target.image = assets.clans[clanId];
            }

          } catch (loadError) {
            console.error(`Lỗi tải ảnh clan ${clanId} hoặc formation:`, loadError);
            // Quan trọng: Nếu lỗi tải ảnh, gán một ảnh mặc định để không bị lỗi undefined sau này
            assets.clans[clanId] = new Image(); // Gán một đối tượng Image trống
            assets.clansHit[clanId] = new Image();
            assets.formations[clanId] = new Image();
          }
        } else if (change.type === 'removed') {
          delete assets.clans[clanId];
          delete assets.clansHit[clanId];
          delete assets.formations[clanId];
          if (currentTargetId === clanId) {
            target.image = null;
          }
        }
      }
    });
    return () => unsubscribe();
  }, [currentTargetId, userData?.clanId]); // userData.clanId trong dependencies để react-hook re-run khi clanId thay đổi

  return {
    canvasRef,
    startMoving: useCallback((dir: 'up' | 'down' | 'left' | 'right') => { movementState.current[dir] = true; }, []),
    stopMoving: useCallback((dir: 'up' | 'down' | 'left' | 'right') => { movementState.current[dir] = false; }, []),
    fireProjectile,
  };
}