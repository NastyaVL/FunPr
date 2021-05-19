import {Container, GameState, Tween, Anim, Loader, Picture} from 'MotivationGame/core';
import {IPoint, ROOT_CONTAINER } from '../../../_core/Interfaces';
import VehicleRace from '../VehicleRace';

// Название главного контейнера в игре
const MAIN_CONTAINER_NAME = 'main';
// Массив выбранных транспортов для игры
const RACE_FRONT_VIEW_CONTAINER = [
    'quadro_racefrontview_container',
    'rat_racefrontview_container'
];
export default class DFirstPerson extends GameState {
    protected scene: VehicleRace;

    name(): string {
        return 'FirstPerson';
    }

    // Начальное состояние стейта
    start(): void {
        super.start();
        this.addRunningPlayers(this.scene.sm.options);
    }

    /**
     * Добавляем учасников гонки на сцену 
     */
    addRunningPlayers(data: any): void {
        // Массив учасников гонки, стоящих перед нами в списке
        let personMembersArray = [];
        // Последовательность наложения слоёв
        let createOrder = 1000;
        let abc;

        this.makeAllTransportInvisibleAndChangeContainer();
        const membersSorted = Object.values(data.gameOptions.configMembers)
        const isUserPlace = membersSorted.findIndex((item) => item.isUser ) + 1;
        const isUserTransport = membersSorted[isUserPlace].transport;
        this.chooseCurrentTransport(isUserTransport);
        const positions = this.getPlayerPositions(isUserPlace);
        personMembersArray = this.choosePersons(isUserPlace, membersSorted, personMembersArray);

        for (let index = personMembersArray.length - 1; index >= 0; index--) {
            const isShow = index < personMembersArray.length;
            const playerTransport = personMembersArray[index].transport;

            abc = this.scene.getControl(`${playerTransport}_${index}`, MAIN_CONTAINER_NAME);
            if (abc !== undefined) {
                abc.destroy({ children: true });
            }
            if (isShow) {
                if (!Loader.additionalTypes.includes(playerTransport)) {
                    throw new Error(`${playerTransport} not loaded`);
                }
                let etalonTransport = this.scene.getControl(playerTransport, ROOT_CONTAINER);
                let transportContainer = etalonTransport = this.cloneEtalonTransport(etalonTransport, index, playerTransport, positions, createOrder);
                this.tintPlayer(transportContainer, playerTransport, this.scene.colorToNumber(personMembersArray[index].colorPerson));
                if (this.animatePlayer(playerTransport)) {
                    this.startPlayerMove(transportContainer.nickname);
                };
                this.scene.addPlayerIcon(personMembersArray[index], index, playerTransport, transportContainer);

            }
        }
    }

    /**
     * Подготовка к началу гонки
     * Делаем все контейнеры с транспортами невидимыми
     * Переносим транспорт из одного контейнера в другой
     */
    makeAllTransportInvisibleAndChangeContainer(): void {
        const mainContainer = this.scene.getControl('main') as Container;
        RACE_FRONT_VIEW_CONTAINER.forEach((item) => {
            let container = this.scene.getControl(item) as Container;
            if (container) {
                this.changeContainer(container, mainContainer);
            } else {
                container = this.scene.getControl(item, mainContainer.nickname) as Container;
            }
            this.scene.getControl(item, MAIN_CONTAINER_NAME).visible = false;
        });
    }

    /**
     * Делаем копии контейнеров с транспортами и расставляем их по координатам в игре
     * @param etalonTransport 
     * @param index 
     * @param playerTransport 
     * @param positions 
     * @param createOrder 
     */
    cloneEtalonTransport(etalonTransport, index, playerTransport, positions, createOrder): Container {
        let transportContainer = etalonTransport.clone({
            nickname: `${playerTransport}_${index}`,
            parentNickname: MAIN_CONTAINER_NAME
        });
        transportContainer.createOrder = ++createOrder;
        transportContainer.x = positions[index].x;
        transportContainer.y = positions[index].y;
        transportContainer.visible = true;
        return transportContainer;
    }

    /**
     * Изменяем контейнеры родителей у детей
     * @param {Container} container текущий контейнер
     * @param {Container} mainContainer основной контейнер игры
     */
    changeContainer(container: Container, mainContainer: Container): void {
        container.parent = mainContainer;
        delete this.scene.controls[ROOT_CONTAINER][container.nickname];
        this.scene.controls[mainContainer.nickname][container.nickname] = container;      
    }

    /**
     * Тонируем учасника гонки
     * @param {Container} transportContainer контейнер со всеми элементами транспорта
     * @param {String} playerTransport транспорт текущего учасника
     * @param {Number} tint цвет текущего учасника
     */
    tintPlayer(transportContainer: Container, playerTransport: string, tint: number): void {
        if (playerTransport === 'quadro') {
            this.tintPlayerHelperQuadro(transportContainer, tint);
        }
        if (playerTransport === 'rat') {
            this.tintPlayerHelperRat(transportContainer, tint);
        }
    }

    tintPlayerHelperQuadro(transportContainer: Container, tint: number): void {
        transportContainer.children.forEach((c) => {
            if (c.nickname.includes('_color')) {
                (c as Picture | Anim).tint = tint;
            }
        });
    }

    tintPlayerHelperRat(transportContainer: Container, tint: number): void {
        transportContainer.children.forEach((c) => {
            if (c.nickname.includes('_color')) {
                if (c.nickname.includes('_color2')) {
                    (c as Picture | Anim).tint = [0xcc5500, 0x082567, 0x008080][Math.floor(Math.random() * 3)];
                } else if (c.nickname.includes('_color3')) {
                    (c as Picture | Anim).tint = [0xaac688, 0xbdb76b, 0xaddfad][Math.floor(Math.random() * 3)];
                } else {
                    (c as Picture | Anim).tint = tint;
                }
            }
        });
    }

    /**
     * Выбираем игроков, которых будем отображать на сцене
     * @param {Number} isUserPlace место текущего учасника
     * @param {Object} members учасники
     * @param {Array} array массив учасников
     */
    choosePersons(isUserPlace: number, members: object, array: Array<any>):Array<any> {
        let arr = array.slice();
        for (let i = isUserPlace - 2; i >= 0; i--) {
            if (arr.length >= 3) {
                break;
            }
            arr.push(Object.values(members)[i]);
        }
        return arr;
    }

    /**
     * Выбираем текущий транспорт (транспорт, на котором едем мы)
     * @param {String} transport 
     */
    chooseCurrentTransport(transport: string): void {
        const view = this.scene.getControl(`${transport}_racefrontview_container`, MAIN_CONTAINER_NAME);
        view.visible = true;
        view.createOrder = view.parent.children.length;
    }

    /**
     * Нужно ли анимировать учасников гонки, которые находятся впереди нас
     * @param {String} playerTransport транспорт игрока
     */
    animatePlayer(playerTransport: string): boolean {
        return playerTransport === 'quadro';
    }

    /**
     * Расставляем учасников гонки, которые находятся перед нами, по позициям на сцене игры
     * @param {Number} n наше место в рейтинге 
     */
    getPlayerPositions(n: number): IPoint[] {
        if (n === 1) {
            return [];
        }
        if (n === 2) {
            return [
                {x: 720, y: 420}
            ];
        }
        if (n === 3) {
            return [
                {x: 800, y: 400},
                {x: 600, y: 400}
            ];
        } else {
            return [
                {x: 800, y: 400},
                {x: 700, y: 350},
                {x: 600, y: 400}
            ];
        }
    }

    /**
     * Анимируем движение контейнера учасника, стоящего перед нами
     * @param {String} nameContainer название контейнера
     */
    startPlayerMove(nameContainer: string): void {
        this.startPlayerMoveHelper(nameContainer);
    }

    startPlayerMoveHelper(nameContainer: string): void {
        const r = Math.random() / 10;
        const player = this.scene.getControl('body', nameContainer);
        const player2 = this.scene.getControl('body_color_mask', nameContainer);

        const bike = this.scene.getControl('bike', nameContainer);

        const player3 = this.scene.getControl('head', nameContainer);
        const player4 = this.scene.getControl('head_color_mask', nameContainer);

        const twinBody = this.scene.addTween();
        twinBody
            .addControl(player)
            .addControl(player2)
            .addControl(player3)
            .addControl(player4)
            .addControl(bike)
            .do({ rotation: [-r, r] }, Tween.LinearBack)
            .start(2000, undefined, -1);
    }
}