/** Plays real matches in the browser and checks a human could follow them. */
import { chromium } from "playwright";
const OUT="/tmp/claude-0/-home-user-cete-savaslari/247b4fa8-47d7-5569-bff2-c88ad56a6ff4/scratchpad";
const LETTER="[\\p{L}\\p{N}_]";
const BAD=new RegExp(`(?<!${LETTER})(null|undefined)(?!${LETTER})|(?<!${LETTER})NaN(?!${LETTER})|\\[object Object\\]`,"u");
const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:["--no-sandbox"]});
let bad=0;
for (const [theme,w,h,deckIdx] of [["veto-h",1440,1000,0],["veto-h",390,844,2],["gett-oh",1440,1000,1],["gett-oh",320,568,3]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{ localStorage.setItem("tariklab.language","tr");
    localStorage.setItem("tariklab.duel.onboarding.v1","done"); });  // play as a returning player
  const p=await ctx.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:8090/games/${theme}/index.html`,{waitUntil:"load"});
  await p.getByRole("button",{name:"Yeni Düello",exact:true}).click();
  await p.locator(".setup-wizard").waitFor();
  // Pick a different preset each run so more than one list is exercised.
  const chips=p.locator(".setup-wizard .identity-grid .choice-chip");
  if (await chips.count()>deckIdx) await chips.nth(deckIdx).click();
  await p.locator('[data-pick="setup-next"]').click();
  const profs=p.locator(".setup-wizard .identity-grid .choice-chip");
  if (await profs.count()>1) await profs.nth(deckIdx%5).click();
  await p.locator('[data-pick="setup-next"]').click();
  await p.locator('[data-pick="setup-start"]').click();
  for(let i=0;i<25;i++){for(const n of ["Taş","Kağıt","İlk Başla","Sonra Başla"]){const x=p.getByRole("button",{name:n,exact:true}); if(await x.isVisible().catch(()=>false)) await x.click();} if(await p.getByRole("button",{name:"Düelloyu Başlat",exact:true}).isVisible().catch(()=>false)) break; await p.waitForTimeout(100);}
  await p.getByRole("button",{name:"Düelloyu Başlat",exact:true}).click();
  await p.locator(".duel-table").waitFor(); await p.waitForTimeout(300);
  // Play a long stretch: take offered actions, inspect cards, keep going.
  let nullHits=0, inspected=0, moves=0;
  for(let step=0; step<90; step++){
    const cards=p.locator(".hand-row .playing-card, .player-field.player .playing-card");
    const n=await cards.count();
    if(n){ await cards.nth(step%n).click({timeout:1200}).catch(()=>{}); inspected++;
      const panel=(await p.locator("dialog.inspector-sheet").count())
        ? p.locator("dialog.inspector-sheet .dialog-body") : p.locator(".inspector-body");
      const txt=(await panel.innerText().catch(()=>""))||"";
      if(BAD.test(txt)) nullHits++;
      // Take an offered action sometimes, including deliberately poor ones.
      const act=p.locator(".inspector-actions button");
      if(await act.count() && step%3===0){ await act.first().click().catch(()=>{}); moves++; await p.waitForTimeout(200);
        const conf=p.getByRole("button",{name:"Onayla",exact:true});
        if(await conf.isVisible().catch(()=>false)) await conf.click().catch(()=>{}); }
      if(await p.locator("dialog[open]").count()) await p.keyboard.press("Escape");
    }
    const prim=p.locator(".action-dock > button.primary");
    if(await prim.count()){ await prim.first().click().catch(()=>{}); await p.waitForTimeout(180); }
    else await p.waitForTimeout(120);
  }
  const flow=(await p.locator(".ledger .turn-history").innerText().catch(()=>""))||"";
  const unexplained=flow.split("\n").filter(l=>/^(Siz|Rakip):\s*(Etki|Effect)$/.test(l.trim())).length;
  const flowNull=BAD.test(flow);
  const ok = nullHits===0 && unexplained===0 && !flowNull && !errs.length;
  if(!ok) bad++;
  console.log(`${ok?"PASS":"FAIL"} ${theme} ${w}x${h}: ${inspected} inspections, ${moves} moves taken, ${nullHits} nullish panels, ${unexplained} unexplained flow lines, flowNull=${flowNull}`);
  if(errs.length) console.log(`     page error: ${errs[0].slice(0,100)}`);
  await p.screenshot({path:`${OUT}/playtest-${theme}-${w}x${h}.png`});
  await ctx.close();
}
await b.close();
console.log(bad?`\n${bad} playtest(s) failing`:"\nplaytests clean");
process.exit(bad?1:0);
