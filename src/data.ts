/**
 * Verified dataset for the True Damage Ekko concept page.
 *
 * Every number here traces to the `ekko-truedamage/` toolkit in this workspace
 * (mesh/triangle/texture counts come from its validated GLB manifests, the dates
 * from its LoL-Wiki skin timeline), not from invention.
 *
 * IP note: champion/skin names, official localised ability names and all art are
 * Riot Games property. This page is a non-commercial fan concept; see README.
 */

import { asset } from './lib/asset';

export type Skin = {
  id: string;
  cn: string;
  en: string;
  released: string;
  meshes: number;
  tris: string;
  textures: number;
  art: string;
  glb: string;
  note: string;
};

/** The three Ekko skins this workspace actually extracted, newest last. */
export const SKINS: Skin[] = [
  {
    id: '245019',
    cn: '真实伤害',
    en: 'True Damage Ekko',
    released: '2019-11-10',
    meshes: 5,
    tris: '12,820',
    textures: 2,
    art: asset('assets/splash-td.jpg'),
    glb: asset('assets/ekko-td.glb'),
    note: '本页主推。霓虹紫与青的主色即取自这张原画。',
  },
  {
    id: '245056',
    cn: '真实伤害 · 破茧',
    en: 'Breakout True Damage Ekko',
    released: '2023-11-08',
    meshes: 6,
    tris: '15,398',
    textures: 5,
    art: asset('assets/splash-breakout.jpg'),
    glb: asset('assets/ekko-breakout.glb'),
    note: '原版的变体皮肤，部件与贴图数量都更多。',
  },
  {
    id: '245057',
    cn: '双城之战 · 最后一战',
    en: 'Arcane Last Stand Ekko',
    released: '2024-12-11',
    meshes: 8,
    tris: '25,900',
    textures: 4,
    art: asset('assets/card-arcane.png'),
    glb: asset('assets/ekko-arcane.glb'),
    note: '最新一款艾克皮肤，也是本工作区里精度最高的网格。',
  },
];

/**
 * Abilities. The English names are Riot's official ability names; the Chinese
 * names follow the official localisation and the flavour lines are fan-written
 * concept copy (not Riot tooltip text).
 */
export type Ability = {
  key: string;
  cn: string;
  en: string;
  flavor: string;
};

export const ABILITIES: Ability[] = [
  { key: 'P', cn: 'Z 型驱动共振', en: 'Z-Drive Resonance', flavor: '同一目标吃到第三次打击，时间会替你多记一笔。' },
  { key: 'Q', cn: '时间卷曲器', en: 'Timewinder', flavor: '扔出去的是未来，收回来的是过去。' },
  { key: 'W', cn: '平行收敛', en: 'Parallel Convergence', flavor: '把一个还没发生的瞬间提前钉在地上。' },
  { key: 'E', cn: '相位俯冲', en: 'Phase Dive', flavor: '翻过一整条街，也翻过一整秒。' },
  { key: 'R', cn: '时空断裂', en: 'Chronobreak', flavor: '倒带四秒。这四秒里你做什么都算数。' },
];

/** Stats block — labels + values, all from the toolkit manifests. */
export const STATS: Array<{ label: string; value: string }> = [
  { label: '皮肤 ID / Skin ID', value: '245019' },
  { label: '发布时间 / Released', value: '2019-11-10' },
  { label: '部件 / Meshes', value: '5' },
  { label: '三角面 / Triangles', value: '12,820' },
  { label: '贴图 / Textures', value: '2' },
  { label: '系列 / Line', value: 'TRUE DAMAGE' },
];

export const MARQUEE_TOP = ['TRUE DAMAGE', 'EKKO', '245019', '✦'];
export const MARQUEE_FOOT = ['TRUE DAMAGE', '/', 'EKKO', '/'];

export const NAV_ITEMS = [
  { label: '皮肤档案', href: '#archive' },
  { label: '技能', href: '#abilities' },
  { label: '皮肤阵容', href: '#lineup' },
  { label: '数据', href: '#stats' },
  { label: '获取', href: '#get' },
];

export const SOCIALS = [
  { label: 'League of Legends', href: 'https://www.leagueoflegends.com/' },
  { label: 'Ekko Wiki', href: 'https://leagueoflegends.fandom.com/wiki/Ekko/LoL' },
  { label: 'CommunityDragon', href: 'https://www.communitydragon.org/' },
  { label: 'Riot Fan Policy', href: 'https://www.riotgames.com/en/legal' },
];
