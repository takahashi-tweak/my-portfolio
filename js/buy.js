const isShow='is-show';
const evo='evo';
const lock='lock';
const heal='heal';

// ゲームの状態を管理

let gameState={
    money:4,
    goodsLevel:1,
    goodsLevelUpCost:5,
    goodsListLimit:3,
    life:20,
    buyTurnCount:0,
    keepBattle:true
}

const BATTLE_SPEED=1000;
const EVO_COUNT=3;

// ゲームの状態をリセット

const resetGameState=function(){
    gameState={
        money:4,
        goodsLevel:1,
        goodsLevelUpCost:5,
        goodsListLimit:3,
        life:20,
        buyTurnCount:0,
        keepBattle:true
    }

    document.querySelectorAll('.vb-battle__monsterArea').forEach(el => {
        el.replaceChildren();
    });
}

// ゲームの状態の値更新

const updateGameState=function(){
    document.querySelector('.vb-buy__money').textContent=gameState.money;
    document.querySelector('.vb-buy__goodsLevel').textContent=gameState.goodsLevel;
    document.querySelector('.vb-buy__level').textContent=gameState.goodsLevelUpCost;
    document.querySelector('.vb-buy__life').textContent=gameState.life;
}

// 商品に作成可能なモンスター一覧

let creatableMonsters=[];

const pickCreatableMonsters=function(){
    creatableMonsters=monster_data.filter(
        monster => monster.evo && monster.rarity<=gameState.goodsLevel
    );
}

// 商品ロックidの取得

let lockGoodsItemIds=[];

const lockGoodsItem=function(){
    document.querySelectorAll('.vb-buy__goods .lock').forEach(monster => {
        lockGoodsItemIds.push(Number(monster.dataset.id));
    });
}

document.querySelector('.vb-buy__lock').addEventListener('click',function(){
    this.classList.toggle(lock);

    document.querySelectorAll('.vb-buy__goods > .vb-buy__monster').forEach(monster => {
        monster.classList.toggle(lock);
    });
});

// 商品ロックidのリセット

const resetLock=function(){
    lockGoodsItemIds=[];

    document.querySelectorAll('.lock').forEach(el => {
        el.classList.remove(lock);
    });
}

// ロックを考慮して作成可能モンスター選択

const selectMonster=function(creatableMonsters,index){
    const creatableMonstersLength=creatableMonsters.length;

    let randomIndex=Math.floor(Math.random()*creatableMonstersLength);

    const lockGoodsItemIdsLength=lockGoodsItemIds.length;

    if(lockGoodsItemIdsLength>0 && index<lockGoodsItemIdsLength){
        const lockId=lockGoodsItemIds[index];

        const lockIndex=creatableMonsters.findIndex(
            monster => monster.id===lockId
        );

        if(lockIndex!==-1){
            randomIndex=lockIndex;
        }
    }

    return creatableMonsters[randomIndex];
}

// スキルHTML作成

const createSkillHTML=function(skills){
    let skillHTML='';
    if(skills.length>0){
        skillHTML=skills.map(skill => `<li>${skill}</li>`).join('');
    }

    return skillHTML;
}

// 商品モンスター1体分のHTML作成

const createMonsterHTML=function(monster){
    const skillHTML=createSkillHTML(monster.skill);

    const monsterHTML=
    `<div class="vb-buy__monster" data-id="${monster.id}" draggable="true">
        <div class="vb-buy__img"><img src="img/monster/${monster.id}.jpg" alt="${monster.name}"></div>
        <div class="vb-buy__hp">${monster.hp}</div>
        <div class="vb-buy__status">
            <div class="vb-buy__atk">${monster.atk}</div>
            <div class="vb-buy__def">${monster.def}</div>
            <div class="vb-buy__int">${monster.int}</div>
            <div class="vb-buy__spd">${monster.spd}</div>
        </div>
        <ul class="vb-buy__skill">${skillHTML}</ul>
        <div class="vb-buy__category" data-category="${monster.category}"><img src="img/category-${monster.category}.png" alt=""></div>
        <div class="vb-buy__name">${monster.name}</div>
    </div>`;

    return monsterHTML;
}

// 商品のDOM生成

const createGoodsItemDOM=function(creatableMonsters){
    let goodsItemHTML='';

    for(let i=0;i<gameState.goodsListLimit;i++){
        const monster=selectMonster(creatableMonsters,i);
        
        goodsItemHTML+=createMonsterHTML(monster);
    }
    document.querySelector('.vb-buy__goods').innerHTML=goodsItemHTML;

    resetLock();
}

// 商品LVUP

document.querySelector('.vb-buy__level').addEventListener('click',function(){
    if(gameState.money>=gameState.goodsLevelUpCost && gameState.goodsLevel<6){
        gameState.money-=gameState.goodsLevelUpCost;
        gameState.goodsLevel++;

        gameState.goodsLevelUpCost++;
        if(gameState.goodsLevelUpCost===10){
            gameState.goodsLevelUpCost="-";
        }

        updateGameState();

        if(gameState.goodsLevel%2===0){
            gameState.goodsListLimit++;
        }
    }
});

// 商品更新

document.querySelector('.vb-buy__change').addEventListener('click',function(){
    if(gameState.money>=1){
        pickCreatableMonsters();
        createGoodsItemDOM(creatableMonsters);

        gameState.money--;
        updateGameState();

        resetLock();
    }
});

// 手持ちモンスターのHTML作成

const createHandMonsterHTML=function(monster){
    const detailHTML=createMonsterHTML(monster);

    const monsterHTML=
    `<div class="vb-battle__monster" data-id="${monster.id}" draggable="true">
        <div class="vb-battle__img"><img src="img/monster/${monster.id}.jpg" alt="${monster.name}"></div>
        <div class="vb-battle__hp">
            <span class="vb-battle__hp--now">${monster.hp}</span>/<span class="vb-battle__hp--max">${monster.hp}</span>
        </div>
        <div class="vb-battle__status">
            <div class="vb-battle__atk">${monster.atk}</div>
            <div class="vb-battle__def">${monster.def}</div>
            <div class="vb-battle__int">${monster.int}</div>
            <div class="vb-battle__spd">${monster.spd}</div>
        </div>
        <div class="vb-battle__category" data-category="${monster.category}"><img src="img/category-${monster.category}.png" alt=""></div>
        <div class="vb-battle__name">${monster.name}</div>
        <div class="vb-battle__detail">${detailHTML}</div>
        <div class="vb-battle__value"></div>
    </div>`;

    return monsterHTML;
}

// モンスター詳細の幅と高さ取得

let detailWidth;
let detailHeight;

const getMonsterDetailWidthHeight=function(){
    const monster=document.querySelector('.vb-buy__monster');

    detailWidth=monster.offsetWidth;
    detailHeight=monster.offsetHeight;
}

// 手持ちモンスターの幅と高さ設定

const setMonsterDetailWidthHeight=function(){
    document.querySelectorAll('.vb-battle__detail').forEach(el => {
        el.style.width=detailWidth + 'px';
        el.style.height=detailHeight + 'px';
    });
}

// 手持ちのDOM生成

const createHandDOM=function(monsterId){
    let monsterHTML='';

    const monster=monster_data[monsterId - 1];

    monsterHTML=createHandMonsterHTML(monster);
    document.querySelector('.vb-buy__hand').insertAdjacentHTML('beforeend',monsterHTML);

    getMonsterDetailWidthHeight();
    setMonsterDetailWidthHeight();
}

// 手持ちモンスターの詳細表示

document.body.addEventListener('mouseup',function(e){
    const monster=e.target.closest('.vb-battle__monster');

    if(monster){
        monster.querySelector('.vb-battle__detail').classList.add(isShow);
    }
});

// 手持ちモンスターの詳細非表示

document.body.addEventListener('mousedown',function(){
    document.querySelectorAll('.vb-battle__detail').forEach(
        el => el.classList.remove(isShow)
    );
});

// 進化前モンスターの削除

const delateBeforeEvo=function(monsterId){
    document.querySelectorAll(`[data-id="${monsterId}"]`).forEach(
        el => el.remove()
    );
}

// 進化後モンスターにclass付与

const addEvoClass=function(monsterId){
    document.querySelectorAll(`[data-id="${monsterId}"]`).forEach(el => {
        el.classList.add(evo);

        const monster=el.querySelector('.vb-buy__monster');
        if(monster){
            monster.classList.add(evo);
        }
    });
}

// モンスターの進化

const evoMonster=function(){
    let monsterIds=[];
    let monsterCount={};

    document.querySelectorAll('.vb-buy__inner .vb-battle__monster').forEach(monster => {
        monsterIds.push(Number(monster.dataset.id));
    });

    monsterIds.forEach(monsterId => {
        if(monsterId%2===1){
            monsterCount[monsterId]=(monsterCount[monsterId] || 0) + 1;

            if(monsterCount[monsterId]===EVO_COUNT){
                delateBeforeEvo(monsterId);

                const evoMonsterId=monsterId + 1;

                createHandDOM(evoMonsterId);
                addEvoClass(evoMonsterId);
            }
        }
    });
}

// モンスターの削除

const delateMonster=function(){
    document.querySelectorAll('.delete').forEach(
        el => el.remove()
    );
}

// 商品の購入

let startDragPoint;
let endDragPoint;
let dragMonsterId;

const buyGoodsItem=function(e){
    const hand=e.currentTarget;

    const handMonsterLength=hand.querySelectorAll('.vb-battle__monster').length;
    endDragPoint=hand.className;

    if(
        gameState.money>=3 &&
        handMonsterLength<10 &&
        startDragPoint==='buy_goods' &&
        endDragPoint==='vb-buy__hand'
    ){
        createHandDOM(dragMonsterId);

        delateMonster();

        gameState.money-=3;
        updateGameState();

        evoMonster();
    }
}

// 商品購入のdrag操作

document.body.addEventListener('mousedown',function(e){
    const monster=e.target.closest('.vb-buy__monster');

    if(monster){
        document.querySelectorAll('.vb-buy__monster, .vb-battle__monster').forEach(
            el => el.classList.remove('delete')
        );
        monster.classList.add('delete');

        startDragPoint=monster.parentElement.id;
        dragMonsterId=Number(monster.dataset.id);
    }
});

document.querySelector('.vb-buy__hand').addEventListener('dragover',function(e){
    e.preventDefault();
});
document.querySelector('.vb-buy__hand').addEventListener('dragenter',function(e){
    e.preventDefault();
});
document.querySelector('.vb-buy__hand').addEventListener('drop',buyGoodsItem);

// モンスターの編成と売却

let dragMonsterDOM;
let monsterAreaIndex;

const dragMonster=function(e){
    const monsterArea=e.currentTarget;
    const monsterAreaHTML=monsterArea.innerHTML;

    const storageDOM=monsterArea.firstElementChild;

    endDragPoint=monsterArea.className;

    if(startDragPoint==='buy_hand'){
        if(
            monsterAreaHTML===''&&
            endDragPoint==='vb-battle__monsterArea'
        ){
            monsterArea.appendChild(dragMonsterDOM);
        }
        else if(endDragPoint==='vb-buy__goods'){
            delateMonster();

            gameState.money++;
            updateGameState();
        }
    }
    else if(startDragPoint===''){
        if(endDragPoint==='vb-battle__monsterArea'){
            monsterArea.appendChild(dragMonsterDOM);
            if(storageDOM!==null){
                document.querySelectorAll('.vb-buy__field > .vb-battle__monsterArea')[monsterAreaIndex].appendChild(storageDOM);
            }
        }
        else if(endDragPoint==='vb-buy__goods'){
            delateMonster();

            gameState.money++;
            updateGameState();
        }
    }
}

// モンスターのdrag操作

document.body.addEventListener('mousedown',function(e){
    const monster=e.target.closest('.vb-battle__monster');

    if(monster){
        dragMonsterDOM=monster;

        const monsterArea=monster.parentElement;
        const monsterAreas=document.querySelectorAll('.vb-buy__field > .vb-battle__monsterArea');
        monsterAreaIndex=[...monsterAreas].indexOf(monsterArea);

        document.querySelectorAll('.vb-buy__monster, .vb-battle__monster').forEach(
            el => el.classList.remove('delete')
        );
        monster.classList.add('delete');

        startDragPoint=monster.parentElement.id;
    }
});

document.querySelectorAll('.vb-buy__field > .vb-battle__monsterArea').forEach(el => {
    el.addEventListener('dragover',function(e){
        e.preventDefault();
    });
    el.addEventListener('dragenter',function(e){
        e.preventDefault();
    });
    el.addEventListener('drop',dragMonster);
});

document.querySelector('.vb-buy__goods').addEventListener('dragover',function(e){
    e.preventDefault();
});
document.querySelector('.vb-buy__goods').addEventListener('dragenter',function(e){
    e.preventDefault();
});
document.querySelector('.vb-buy__goods').addEventListener('drop',dragMonster);

// 購入フェーズ

const startBuyPhase=function(){
    gameState.money=4 + gameState.buyTurnCount;
    if(gameState.money>10){
        gameState.money=10;
    }

    updateGameState();

    pickCreatableMonsters();
    createGoodsItemDOM(creatableMonsters);
}
startBuyPhase();