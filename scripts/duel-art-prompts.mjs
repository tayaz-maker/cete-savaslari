import {readFileSync} from 'node:fs';
import {families,bosses,spells,traps} from './duel-expansion-source.mjs';

export const styleBible={
 'veto-h':'Cinematic painted political realism, rich graphic-novel brushwork, fictional Turkish civic and election-night world, charcoal, institutional dark green, parchment and warm brass, practical lamplight. No real politician or actual party branding.',
 'gett-oh':'Cinematic painted Istanbul neighborhood realism, rich graphic-novel brushwork, grounded ordinary residents and street trades, tobacco brown, burgundy, dirty amber, muted green and night blue, sodium light, tea steam, weathered shops and Bosphorus atmosphere. No Hollywood gangster cosplay or fantasy.'
};
export const backgroundPrompts={
 'veto-h':'Original cinematic painted environment plate for a premium Turkish election-night card duel. Very wide landscape, no user interface, no cards, no board, no text, no logos, no real politician, no party symbol. A grand fictional civic campaign headquarters after dark: green glass, warm brass desk lamps, deep charcoal stone columns, distant glowing city and a subtle crowd silhouette outside tall windows. Keep central lower two thirds dark and calm with an empty tactile dark green tabletop, light architectural detail around upper and side edges only. Sophisticated restrained chiaroscuro, political thriller graphic-novel painting, no neon, no fantasy, no real state emblems. 16:9.',
 'gett-oh':'Original cinematic painted environment plate for a premium Istanbul neighborhood card duel. Very wide landscape, no UI, no cards, no board, no labels, no writing, no logos, no real people. An old Istanbul kahvehane beside a wet cobbled alley at night: aged tobacco-brown wood, muted burgundy banquette, amber hanging lamps, steaming thin-waisted tea glasses at the far edges, distant Bosphorus lights through rain-streaked windows, a yellow taxi silhouette outside. Keep central lower two thirds dark, calm and empty as a tactile wooden tabletop, detailed atmosphere around upper and side edges. Grounded cinematic graphic-novel brushwork, subtle night-blue shadows, warm brass highlights, no Hollywood gangster cosplay, no fantasy, no neon spectacle. 16:9.'
};
export function artCards(theme){
 const source=JSON.parse(readFileSync(`public/games/${theme}/source-cards.json`,'utf8'));
 if(source.length>=300)return source;
 const old=source.filter(c=>Number(c.id.slice(-3))<=150);
 const names=[...families[theme].flatMap(row=>row[2].split(';')),...bosses[theme],...spells[theme].split(';'),...traps[theme].split(';')];
 return [...old,...names.map((name,i)=>({id:`${theme==='veto-h'?'SND':'RCN'}-${String(i+151).padStart(3,'0')}`,name:name.split('|')[0],english:name.split('|')[1]}))];
}
export function atlasPrompt(theme,cards){
 return `Create a production card-art ATLAS, precisely FOUR equal columns and THREE equal rows: twelve separate complete edge-to-edge landscape 4:3 paintings, no gaps, borders, numbers, captions, lettering, logos or UI. Output 3072×1728 if possible. Every cell depicts its own subject and location, NOT a shared panorama. ${styleBible[theme]} Read cells left-to-right then top-to-bottom. Subjects: ${cards.map((c,i)=>`(${i+1}) ${c.name}${c.english?` (${c.english})`:''}: a specific believable scene expressing this concept; ${i%4===0?'close-up of key prop or working hands':i%4===1?'three-quarter human scene with foreground depth':i%4===2?'wide environmental storytelling':'intimate dramatic mid-shot'}`).join('; ')}. Vary faces, gender, age, wardrobe, pose, camera and day/night across cells. Objects and events must not all become male portraits. Invent no celebrities. Distinct memorable silhouettes, tactile materials, readable lighting. Art only. Do not print the subject names or slogans in the scene. Blank paper is preferable to readable writing. No card frames, no game text, no watermarks, no historical leader portraits or busts. Avoid recurring curly-haired faces: vary straight hair, cropped hair, baldness, braids, headscarves and silver hair where people appear. Keep each composition safely inside its cell.`;
}
if(process.argv.includes('--queue')){
 const queue=[];
 for(const theme of ['veto-h','gett-oh']){
  const cards=artCards(theme);
  for(let i=0;i<cards.length;i+=12){ const batch=cards.slice(i,i+12); queue.push({key:`${theme}-${batch[0].id}`,theme,cards:batch,prompt:atlasPrompt(theme,batch)}); }
 }
 console.log(JSON.stringify(queue.slice(Number(process.argv[3]||0),Number(process.argv[3]||0)+Number(process.argv[4]||50))));
}
