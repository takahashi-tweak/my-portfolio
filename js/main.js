const isActive='is-active';

// タブメニュー

const tabItems=document.querySelectorAll('.vb-explanation__tabItem');
const tabLists=document.querySelectorAll('.vb-explanation__tabList');

tabItems.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        tabItems.forEach(item => item.classList.remove(isActive));
        tabLists.forEach(list => list.classList.remove(isActive));

        tab.classList.add(isActive);
        tabLists[index].classList.add(isActive);
    });
});

// 進化後モンスター1体分のHTML作成

const createEvoMonsterHTML=function(monster){
    const skillHTML=createSkillHTML(monster.skill);

    const monsterHTML=
    `<div class="vb-buy__monster evo" data-id="${monster.id}" draggable="true">
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

// モンスター一覧生成

const createExplanationMonster=function(){
    for(let i=0;i<6;i++){
        let explanationMonsterHTML='';

        explanationMonsterHTML+=`<p class="vb-explanation__monsterRarity">レアリティ${i + 1}</p>`;

        monster_data.forEach(monster => {
            if(monster.rarity===i + 1 && monster.id%2===1){
                explanationMonsterHTML+=createMonsterHTML(monster);
            }
            else if(monster.rarity===i + 1 && monster.id%2===0){
                explanationMonsterHTML+=createEvoMonsterHTML(monster);
            }
        });

        const element=document.querySelector(`[data-rarity="${i + 1}"]`);

        if(element){
            element.innerHTML=explanationMonsterHTML;
        }
    }
}
createExplanationMonster();