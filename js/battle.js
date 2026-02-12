// 戦闘終了

const endBattlePhase=function(){
    document.querySelector('.vb-battle').classList.remove(isShow);
    document.querySelector('.vb-buy').classList.add(isShow);

    document.querySelector('.vb-battle__text').textContent='戦闘開始';

    startBuyPhase();
}

// 相手モンスターのHTML作成

const createEnemyMonsterHTML=function(monster){
    const detailHTML=createMonsterHTML(monster);

    const monsterHTML=
    `<div class="vb-battle__monster" data-id="${monster.id}" draggable="true">
        <div class="vb-battle__img--reverse"><img src="img/monster/${monster.id}.jpg" alt="${monster.name}"></div>
        <div class="vb-battle__hp--reverse">
            <span class="vb-battle__hp--now">${monster.hp}</span>/<span class="vb-battle__hp--max">${monster.hp}</span>
        </div>
        <div class="vb-battle__status--reverse">
            <div class="vb-battle__atk">${monster.atk}</div>
            <div class="vb-battle__def">${monster.def}</div>
            <div class="vb-battle__int">${monster.int}</div>
            <div class="vb-battle__spd">${monster.spd}</div>
        </div>
        <div class="vb-battle__category--reverse" data-category="${monster.category}"><img src="img/category-${monster.category}.png" alt=""></div>
        <div class="vb-battle__name--reverse">${monster.name}</div>
        <div class="vb-battle__detail">${detailHTML}</div>
        <div class="vb-battle__value"></div>
    </div>`;

    return monsterHTML;
}

// 相手モンスターのDOM生成

const createEnemyDOM=function(){
    for(let i=0;i<enemy_data[gameState.buyTurnCount].length;i++){
        let monsterHTML='';

        const monsterId=enemy_data[gameState.buyTurnCount][i];

        if(monsterId!==0){
            const monster=monster_data[monsterId - 1];
            monsterHTML=createEnemyMonsterHTML(monster);
        }

        document.querySelectorAll('.vb-battle__monsterArea--reverse')[i].innerHTML=monsterHTML;

        setMonsterDetailWidthHeight();
    }
}

// 自分の編成を取得

const getMyField=function(){
    const fieldHTML=document.querySelector('.vb-buy__field').innerHTML;
    document.querySelector('.vb-battle__myField').innerHTML=fieldHTML;
}

// 戦闘モンスター1体分のステータスなどのデータ作成

const getMonsterData=function(monsterId,camp,index){
    const monster=monster_data[monsterId - 1];

    return {
        id:monster.id,
        camp:camp,
        order:index,
        category:monster.category,
        maxHp:monster.hp,
        hp:monster.hp,
        atk:monster.atk,
        def:monster.def,
        int:monster.int,
        spd:monster.spd,
        skill:monster.skill,
        name:monster.name
    }
}

// 戦闘モンスターのステータスなどのデータ作成

let fieldMonsters=[];
let aliveMyMonsters=[0,0,0,0,0,0];
let aliveEnemyMonsters=[0,0,0,0,0,0];

const getFieldMonster=function(){
    fieldMonsters=[];
    aliveMyMonsters=[0,0,0,0,0,0];
    aliveEnemyMonsters=[0,0,0,0,0,0];

    document.querySelectorAll('.vb-battle__myField > .vb-battle__monsterArea').forEach((el,i) => {
        const monster=el.querySelector('.vb-battle__monster');

        if(monster){
            const monsterId=Number(monster.dataset.id);

            const monsterData=getMonsterData(monsterId,'my',i);
            fieldMonsters.push(monsterData);

            aliveMyMonsters[i]=1;
        }
    });
    
    document.querySelectorAll('.vb-battle__enemyField > .vb-battle__monsterArea').forEach((el,i) => {
        const monster=el.querySelector('.vb-battle__monster');

        if(monster){
            const monsterId=Number(monster.dataset.id);

            const monsterData=getMonsterData(monsterId,'enemy',i);
            fieldMonsters.push(monsterData);

            aliveEnemyMonsters[i]=1;
        }
    });
}

// 生存モンスターの数を確認

let aliveMyMonsterCount=0;
let aliveEnemyMonsterCount=0;

const checkAliveMonster=function(){
    aliveMyMonsterCount=0;
    aliveEnemyMonsterCount=0;

    for(let i=0;i<aliveMyMonsters.length;i++){
        aliveMyMonsterCount+=aliveMyMonsters[i];
        aliveEnemyMonsterCount+=aliveEnemyMonsters[i];
    }
}

// 専守防衛の数を確認

let aliveSenshuboueiSkillCount=0;

const checkAliveSenshuboueiSkill=function(){
    aliveSenshuboueiSkillCount=0;

    const aliveSenshuboueiSkills=fieldMonsters.filter(monster => monster.skill.includes('専守防衛') && monster.hp>0);

    aliveSenshuboueiSkillCount=aliveSenshuboueiSkills.length;
}

// 戦闘終了時の判定

const judgeEndBattle=function(myMonster,enemyMonster,senshuboueiSkill){
    if(
        (myMonster===0 && enemyMonster===0) ||
        (senshuboueiSkill===myMonster + enemyMonster && myMonster!==0 && enemyMonster!==0)
    ){
        document.querySelector('.vb-battle__text').textContent='引分';

        gameState.keepBattle=false;
    }
    else if(
        myMonster===0 &&
        enemyMonster>0
    ){
        document.querySelector('.vb-battle__text').textContent='敗北';

        gameState.life-=enemyMonster;
        gameState.keepBattle=false;
    }
    else if(
        myMonster>0 &&
        enemyMonster===0
    ){
        document.querySelector('.vb-battle__text').textContent='勝利';

        gameState.buyTurnCount++;
        gameState.keepBattle=false;
    }
}

// ゲームクリア判定

const judgeGameClear=function(){
    if(gameState.life<=0){
        document.querySelector('.vb-battle__text').textContent='GAME OVER';

        document.querySelector('.vb').addEventListener('click',function(){
            resetGameState();
            endBattlePhase();
        });
    }
    else if(gameState.buyTurnCount>=enemy_data.length){
        document.querySelector('.vb-battle__text').textContent='GAME CLEAR';

        document.querySelector('.vb').addEventListener('click',function(){
            resetGameState();
            endBattlePhase();
        });
    }
    else{
        endBattlePhase();
    }
}

// 戦闘モンスター1体分のステータス更新

const updateStatusText=function(monster,el){
    monster.querySelector('.vb-battle__hp--now').textContent=el.hp;
    monster.querySelector('.vb-battle__atk').textContent=el.atk;
    monster.querySelector('.vb-battle__def').textContent=el.def;
    monster.querySelector('.vb-battle__int').textContent=el.int;
    monster.querySelector('.vb-battle__spd').textContent=el.spd;
}

// 戦闘モンスターのステータス更新

const updateMonsterStatus=function(){
    fieldMonsters.forEach(el => {
        if(el.camp==='my'){
            const monster=document.querySelectorAll('.vb-battle__myField > .vb-battle__monsterArea')[el.order];

            updateStatusText(monster,el);
        }
        else{
            const monster=document.querySelectorAll('.vb-battle__enemyField > .vb-battle__monsterArea')[el.order];

            updateStatusText(monster,el);
        }
    });
}

// 活性スキルの活性値取得

let myKasseiSkill={'red':0,'yellow':0,'blue':0,'green':0,'white':0,};
let enemyKasseiSkill={'red':0,'yellow':0,'blue':0,'green':0,'white':0,};

const getKasseiSkill=function(){
    fieldMonsters.forEach(el => {
        if(el.skill.includes('活性')){
            const value=Math.floor(Math.sqrt(el.int));
            if(el.camp==='my'){
                myKasseiSkill[el.category]+=value;
            }
            else{
                enemyKasseiSkill[el.category]+=value;
            }
        }
    });
}

// 活性スキルの活性合計値取得

const getKasseiSkillValue=function(camp,category){
    let total;

    if(camp==='my'){
        if(category==='white'){
            total=Object.values(myKasseiSkill).reduce((sum,value) => sum + value,0);
        }
        else{
            total=myKasseiSkill[category] + myKasseiSkill.white
        }
    }
    else{
        if(category==='white'){
            total=Object.values(enemyKasseiSkill).reduce((sum,value) => sum + value,0);
        }
        else{
            total=enemyKasseiSkill[category] + enemyKasseiSkill.white
        }
    }

    return total;
}

// 活性スキル

const setKasseiSkill=function(){
    myKasseiSkill={'red':0,'yellow':0,'blue':0,'green':0,'white':0,};
    enemyKasseiSkill={'red':0,'yellow':0,'blue':0,'green':0,'white':0,};

    getKasseiSkill();

    fieldMonsters.forEach(el => {
        const value=getKasseiSkillValue(el.camp,el.category)/100 + 1;

        el.atk=Math.floor(el.atk*value);
        el.def=Math.floor(el.def*value);
        el.int=Math.floor(el.int*value);
        el.spd=Math.floor(el.spd*value);
    });

    updateMonsterStatus();
}

// 戦闘行動順

const actionOrder=function(){
    fieldMonsters.sort((a,b) => b.spd - a.spd);
}

// オート戦闘スピード

const autoBattleSpeed=function(BATTLE_SPEED){
    return new Promise(function(resolve){
        setTimeout(resolve,BATTLE_SPEED);
    });
}

// 攻撃されるモンスターの取得

const getDefenseMonster=function(camp,order){
    return fieldMonsters.find(monster => monster.camp===camp && monster.order===order && monster.hp>0);
}

// ターゲット指定

let myAttackTargetOrder;
let enemyAttackTargetOrder;

const getAttackTarget=function(){
    const enemyAliveMonsters=fieldMonsters.filter(monster => monster.camp==='enemy' && monster.hp>0);

    const enemyMonster=enemyAliveMonsters.reduce(
        (minMonster,monster) => monster.def<minMonster.def ? monster : minMonster
    );

    myAttackTargetOrder=enemyMonster.order;

    const myAliveMonsters=fieldMonsters.filter(monster => monster.camp==='my' && monster.hp>0);

    const myMonster=myAliveMonsters.reduce(
        (minMonster,monster) => monster.def<minMonster.def ? monster : minMonster
    );

    enemyAttackTargetOrder=myMonster.order;
}

// 仮のターゲット設定

let temporaryTargetOrder;

const getTemporaryTarget=function(camp,targetOrder){
    temporaryTargetOrder=targetOrder;

    if(targetOrder>=3){
        const frontOrder=targetOrder - 3;

        const monster=fieldMonsters.find(monster => monster.camp===camp && monster.order===frontOrder && monster.hp>0);
        if(monster){
            temporaryTargetOrder=monster.order;
        }
    }
}

// 守護スキル

const setShugoSkill=function(camp){
    let shugoMonsterOrder=Infinity;

    fieldMonsters.forEach(el => {
        if(
            el.skill.includes('守護') &&
            el.order<3 &&
            el.camp===camp &&
            el.hp>0
        ){
            shugoMonsterOrder=Math.min(shugoMonsterOrder,el.order);
        }
    });

    return shugoMonsterOrder===Infinity ? temporaryTargetOrder : shugoMonsterOrder;
}

// 回復スキルの回復取得

let myKaihukuValue=0;
let enemyKaihukuValue=0;

const getKaihukuSkillValue=function(){
    myKaihukuValue=0;
    enemyKaihukuValue=0;

    fieldMonsters.forEach(el => {
        if(el.skill.includes('回復') && el.hp>0){
            const value=Math.floor(el.maxHp*Math.sqrt(el.int)/100);
            if(el.camp==='my'){
                myKaihukuValue+=value;
            }
            else{
                enemyKaihukuValue+=value;
            }
        }
    });
}

// 回復スキルのhp計算

const setKaihukuSkillValue=function(myKaihukuValue,enemyKaihukuValue){
    fieldMonsters.forEach(el => {
        if(el.camp==='my' && el.hp>0){
            el.hp=el.hp + myKaihukuValue>el.maxHp ? el.maxHp : el.hp + myKaihukuValue;

            const monster=document.querySelectorAll('.vb-battle__myField > .vb-battle__monsterArea')[el.order].querySelector('.vb-battle__value');
            monster.classList.add(heal);
            monster.textContent=myKaihukuValue;
        }
        else if(el.camp==='enemy' && el.hp>0){
            el.hp=el.hp + enemyKaihukuValue>el.maxHp ? el.maxHp : el.hp + enemyKaihukuValue;

            const monster=document.querySelectorAll('.vb-battle__enemyField > .vb-battle__monsterArea')[el.order].querySelector('.vb-battle__value');
            monster.classList.add(heal);
            monster.textContent=enemyKaihukuValue;
        }
    });
}

// 範囲攻撃スキル

let areaTargetOrders=[];

const getAreaTargetOrder=function(attackMonster,order){
    areaTargetOrders=[];
    areaTargetOrders.push(order);

    const defenseCamp=attackMonster.camp==='my' ? 'enemy' : 'my';

    if(
        attackMonster.skill.includes('縦突')
    ){
        if(order<3){
            const areaTargetOrder=order + 3;

            const monster=fieldMonsters.find(monster => monster.camp===defenseCamp && monster.order===areaTargetOrder && monster.hp>0);
            if(monster){
                areaTargetOrders.push(monster.order);
            }
        }
        else{
            const areaTargetOrder=order - 3;

            const monster=fieldMonsters.find(monster => monster.camp===defenseCamp && monster.order===areaTargetOrder && monster.hp>0);
            if(monster){
                areaTargetOrders.push(monster.order);
            }
        }
    }

    if(
        attackMonster.skill.includes('横薙')
    ){
        if(order<3){
            for(let i=0;i<3;i++){
                const areaTargetOrder=i;

                const monster=fieldMonsters.find(monster => order!==areaTargetOrder && monster.camp===defenseCamp && monster.order===areaTargetOrder && monster.hp>0);
                if(monster){
                    areaTargetOrders.push(monster.order);
                }
            }
        }
        else{
            for(let i=0;i<3;i++){
                const areaTargetOrder=i + 3;

                const monster=fieldMonsters.find(monster => order!==areaTargetOrder && monster.camp===defenseCamp && monster.order===areaTargetOrder && monster.hp>0);
                if(monster){
                    areaTargetOrders.push(monster.order);
                }
            }
        }
    }
}

// モンスターの攻撃ダメージ

let attackerReceiveDamage;
let defenderReceiveDamage;

const attackDamage=function(attackMonster,defenseMonster){
    const attackerAtk=attackMonster.skill.includes('魔法攻撃') ? attackMonster.int : attackMonster.atk;
    const attackerDef=attackMonster.def;

    let attackerSkillMagnification=1;
    if(
        attackMonster.skill.includes('縦突') ||
        attackMonster.skill.includes('横薙')
    ){
        attackerSkillMagnification*=1/2;
    }
    if(attackMonster.skill.includes('防御削減')){
        attackerSkillMagnification*=100/85;
    }

    const defenderAtk=defenseMonster.skill.includes('魔法攻撃') ? defenseMonster.int : defenseMonster.atk;
    const defenderDef=defenseMonster.skill.includes('専守防衛') ? defenseMonster.def*2 : defenseMonster.def;

    let defenderSkillMagnification=1;
    if(defenseMonster.skill.includes('防御削減')){
        defenderSkillMagnification*=100/85;
    }

    attackerReceiveDamage=Math.floor(defenderSkillMagnification*defenderAtk**2/attackerDef);
    defenderReceiveDamage=Math.floor(attackerSkillMagnification*attackerAtk**2/defenderDef);
}

// モンスターのhp計算

const calculateHp=function(attackMonster,defenseMonster){
    attackMonster.hp=attackMonster.hp - attackerReceiveDamage>0 ? attackMonster.hp - attackerReceiveDamage : 0;
    defenseMonster.hp=defenseMonster.hp - defenderReceiveDamage>0 ? defenseMonster.hp - defenderReceiveDamage : 0;

    if(attackMonster.hp===0 && attackMonster.camp==='my'){
        aliveMyMonsters[attackMonster.order]=0;
    }
    else if(attackMonster.hp===0 && attackMonster.camp==='enemy'){
        aliveEnemyMonsters[attackMonster.order]=0;
    }

    if(defenseMonster.hp===0 && defenseMonster.camp==='my'){
        aliveMyMonsters[defenseMonster.order]=0;
    }
    else if(defenseMonster.hp===0 && defenseMonster.camp==='enemy'){
        aliveEnemyMonsters[defenseMonster.order]=0;
    }
}

// 攻撃ダメージを表示

const setDamage=function(attackMonster,defenseMonster){
    const attackerCamp=attackMonster.camp;
    const defenderCamp=defenseMonster.camp;

    document.querySelector(`.vb-battle__monsterImg--${attackerCamp} > img`).src=`img/monster/${attackMonster.id}.jpg`;
    document.querySelector(`.vb-battle__monsterImg--${defenderCamp} > img`).src=`img/monster/${defenseMonster.id}.jpg`;

    document.querySelector(`.vb-battle__damage--${attackerCamp}`).textContent=attackerReceiveDamage;
    document.querySelector(`.vb-battle__damage--${defenderCamp}`).textContent=defenderReceiveDamage;

    document.querySelectorAll(`.vb-battle__${attackerCamp}Field > .vb-battle__monsterArea`)[attackMonster.order].querySelector('.vb-battle__value').textContent=attackerReceiveDamage;
    document.querySelectorAll(`.vb-battle__${defenderCamp}Field > .vb-battle__monsterArea`)[defenseMonster.order].querySelector('.vb-battle__value').textContent=defenderReceiveDamage;
}

// 攻撃ダメージを削除

const deleteDamage=function(){
    document.querySelectorAll('.vb-battle__monsterImg > img').forEach(el => {
        el.src='img/bg.png';
    });

    document.querySelectorAll('.vb-battle__damage').forEach(el => {
        el.textContent='';
    });

    document.querySelectorAll('.vb-battle__myField > .vb-battle__monsterArea').forEach(el => {
        if(el.querySelector('.vb-battle__value')){
            el.querySelector('.vb-battle__value').textContent='';
            el.querySelector('.vb-battle__value').classList.remove(heal);
        }
    });

    document.querySelectorAll('.vb-battle__enemyField > .vb-battle__monsterArea').forEach(el => {
        if(el.querySelector('.vb-battle__value')){
            el.querySelector('.vb-battle__value').textContent='';
            el.querySelector('.vb-battle__value').classList.remove(heal);
        }
    });
}

// 戦闘行動開始

const fightMonster=async function(){
    let battleTurn=0;

    await autoBattleSpeed(BATTLE_SPEED);

    do{
        battleTurn++;
        document.querySelector('.vb-battle__text').textContent=`${battleTurn}ターン`;
        await autoBattleSpeed(BATTLE_SPEED);
        document.querySelector('.vb-battle__text').textContent='';

        for(const attackMonster of fieldMonsters){
            checkAliveMonster();
            if(aliveMyMonsterCount===0){
                break;
            }

            if(
                !attackMonster.skill.includes('専守防衛') &&
                attackMonster.hp>0
            ){
                getAttackTarget();

                const defenseCamp=attackMonster.camp==='my' ? 'enemy' : 'my';
                const targetOrder=defenseCamp==='my' ? enemyAttackTargetOrder : myAttackTargetOrder;

                getTemporaryTarget(defenseCamp,targetOrder);
                temporaryTargetOrder=setShugoSkill(defenseCamp);

                getAreaTargetOrder(attackMonster,temporaryTargetOrder);

                for(let i=0;i<areaTargetOrders.length;i++){
                    const defenseMonster=getDefenseMonster(defenseCamp,areaTargetOrders[i]);

                    attackDamage(attackMonster,defenseMonster);
                    calculateHp(attackMonster,defenseMonster);
                    setDamage(attackMonster,defenseMonster);

                    updateMonsterStatus();
                    await autoBattleSpeed(BATTLE_SPEED);

                    deleteDamage();
                    await autoBattleSpeed(BATTLE_SPEED);
                }

                checkAliveMonster();
                if(aliveMyMonsterCount===0 || aliveEnemyMonsterCount===0){
                    break;
                }
            }
        };

        getKaihukuSkillValue();
        setKaihukuSkillValue(myKaihukuValue,enemyKaihukuValue);

        updateMonsterStatus();

        await autoBattleSpeed(BATTLE_SPEED);

        deleteDamage();

        checkAliveSenshuboueiSkill();

        judgeEndBattle(aliveMyMonsterCount,aliveEnemyMonsterCount,aliveSenshuboueiSkillCount);

        await autoBattleSpeed(BATTLE_SPEED);
    }
    while(gameState.keepBattle);

    judgeGameClear();
}

// 戦闘開始

const startBattlePhase=function(){
    gameState.keepBattle=true;

    createEnemyDOM();
    getMyField();
    getFieldMonster();
    setKasseiSkill();
    actionOrder();
    
    fightMonster();
}

// 戦闘フェーズ

document.querySelector('.vb-buy__nextBattle').addEventListener('click',function(){
    lockGoodsItem();

    document.querySelector('.vb-buy').classList.remove(isShow);
    document.querySelector('.vb-battle').classList.add(isShow);

    startBattlePhase();
});