// src/lib/data.ts

// Cập nhật UserData để có tất cả các thuộc tính cần thiết
export interface UserData {
    id: string;
    discordName: string;
    clanId?: string;
    level?: number;
    exp?: number;
    attackPoints?: number;
    maxHp?: number;
    attackDamage?: number;
    pvpWins?: number;
    totalDamageDealt?: number;
    clanContribution?: number;
    equippedTitle?: string;
    isClanMaster?: boolean;
    clanRole?: string;
    unlockedSkins?: string[];
    unlockedTitles?: string[];
    // Thêm các thuộc tính khác ở đây nếu cần
}

// Hàm tính EXP cần thiết cho cấp độ tiếp theo
// CÔNG THỨC NÀY PHẢI ĐỒNG BỘ VỚI BACKEND (index.js)
export function calculateExpNeeded(level: number, expBase: number, expPower: number): number {
    return Math.floor(expBase * Math.pow(level, expPower));
}


// *************** CÁC HÀM VÀ CẤU HÌNH CẦN THIẾT CHO FRONTEND ***************

// Định nghĩa interface cho một Title Item
export interface TitleItem { // THÊM INTERFACE NÀY
  name: string;
  cost: number;
  image: string;
  bonusHp: number;
  bonusAttack: number;
}

// Định nghĩa TITLE_SHOP_ITEMS cho frontend. NÊN ĐỒNG BỘ VỚI BACKEND (index.js -> TITLE_SHOP_ITEMS)
// Dựa trên script.olddd.js và index.js backend, nó có cấu trúc như sau:
export const TITLE_SHOP_ITEMS_CLIENT: Record<string, TitleItem> = { // SỬA KIỂU DỮ LIỆU Ở ĐÂY
  fc_duoc_de: {
    name: "FC Dược Dê",
    cost: 10000,
    image: "images/danhhieu/fc-duoc-de.gif",
    bonusHp: 200,
    bonusAttack: 100,
  },
  toi_la_gay: {
    name: "Tôi là Gay",
    cost: 15000,
    image: "images/danhhieu/toi-la-gay.gif",
    bonusHp: 200,
    bonusAttack: 100,
  },
  tran_pe_du: {
    name: "Trấn Pé Đù",
    cost: 20000,
    image: "images/danhhieu/tran-pe-du.gif",
    bonusHp: 200,
    bonusAttack: 100,
  },
  dung_dau_dai_luc: {
    name: "Đứng Đầu Đại Lục",
    cost: 50000,
    image: "images/danhhieu/dung-dau-dai-luc.gif",
    bonusHp: 200,
    bonusAttack: 100,
  },
  // Thêm các danh hiệu khác nếu có và đảm bảo chúng khớp với backend
};


// Hàm lấy tên cảnh giới từ level và gameConfig động
export function getTitleFromConfig(level: number, levelTitles: Record<string, string> | undefined): string { // SỬA KIỂU levelTitles
  if (!levelTitles) return "Không rõ";
  let title = "Không rõ";
  const sortedTitleLevels = Object.keys(levelTitles).map(Number).sort((a, b) => b - a);
  for (const titleLevel of sortedTitleLevels) {
    if (level >= titleLevel) {
      title = levelTitles[titleLevel.toString()];
      break;
    }
  }
  return title;
}

// Hàm tính chỉ số nhân vật dựa trên level, danh hiệu và gameConfig động
export function calculateStatsWithTitle(
  level: number,
  equippedTitle: string | null | undefined,
  statGrowth: { maxHp: { base: number; perLevel: number; }; attackDamage: { base: number; perLevel: number; }; } | undefined, // SỬA KIỂU statGrowth
  titleShopItems: Record<string, TitleItem> // SỬA KIỂU titleShopItems
) {
  if (!statGrowth) { // Đảm bảo statGrowth không phải undefined
    return { maxHp: 100, attackDamage: 10 }; // Fallback an toàn
  }
  const baseHp = statGrowth.maxHp.base;
  const hpPerLevel = statGrowth.maxHp.perLevel;
  const baseAtk = statGrowth.attackDamage.base;
  const atkPerLevel = statGrowth.attackDamage.perLevel;

  let maxHp = baseHp + hpPerLevel * (level - 1);
  let attackDamage = baseAtk + atkPerLevel * (level - 1);

  if (equippedTitle && equippedTitle !== "none" && titleShopItems[equippedTitle]) {
    maxHp += titleShopItems[equippedTitle].bonusHp;
    attackDamage += titleShopItems[equippedTitle].bonusAttack;
  }
  return { maxHp: Math.floor(maxHp), attackDamage: Math.floor(attackDamage) };
}