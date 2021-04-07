import {Container, GameState, Tween, Anim, Loader, Picture} from 'MotivationGame/core';
import {IPoint, ROOT_CONTAINER } from '../../../_core/Interfaces';
import VehicleRace from '../VehicleRace';

const MAIN_CONTAINER_NAME = 'main';

const RACE_FRONT_VIEW_CONTAINER = [
    'quadro_racefrontview_container',
    'rat_racefrontview_container'
];

const personMembersArray = [];

export default class DFirstPerson extends GameState {
    protected scene: VehicleRace;

    name(): string {
        return 'FirstPerson';
    }

    start(): void {
        super.start();
        this.addRunningPlayers(this.scene.sm.options);
    }

    allTransportInvisible(): void {
        const mainContainer = this.scene.getControl('main') as Container;
        RACE_FRONT_VIEW_CONTAINER.forEach((item) => {
            let container = this.scene.getControl(item) as Container;
            if (container) {
                container.parent = mainContainer;
                delete this.scene.controls[ROOT_CONTAINER][container.nickname];
                this.scene.controls[mainContainer.nickname][container.nickname] = container;
            } else {
                container = this.scene.getControl(
                    item,
                    mainContainer.nickname
                ) as Container;
            }
            this.scene.getControl(item, MAIN_CONTAINER_NAME).visible = false;
        });
    }

    chooseCurrentTransport(transport: string): void {
        const view = this.scene.getControl(`${transport}_racefrontview_container`, MAIN_CONTAINER_NAME);
        view.visible = true;
        view.createOrder = view.parent.children.length;
    }

    addRunningPlayers(data: any): void {
        let transportContainer;
        let createOrder = 1000;
        let abc;

        this.allTransportInvisible();
        const membersSorted = Object.values(data.gameOptions.configMembers)
        const isUserPlace = Object.values(membersSorted).findIndex((item) => item.isUser ) + 1;
        const isUserTransport = Object.values(membersSorted)[isUserPlace].transport;
        this.chooseCurrentTransport(isUserTransport);
        const positions = this.getPlayerPositions(isUserPlace);

        for (let i = isUserPlace - 2; i >= 0; i--) {
            if (personMembersArray.length >= 3) {
                break;
            }
            personMembersArray.push(Object.values(membersSorted)[i]);
        }

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
                const etalonTransport = this.scene.getControl(playerTransport, ROOT_CONTAINER);
                transportContainer = etalonTransport.clone({
                    nickname: `${playerTransport}_${index}`,
                    parentNickname: MAIN_CONTAINER_NAME
                });

                transportContainer.createOrder = ++createOrder;
                transportContainer.x = positions[index].x;
                transportContainer.y = positions[index].y;

                transportContainer.visible = true;
                if (playerTransport === 'quadro') {
                    transportContainer.children.forEach((c) => {
                        if (c.nickname.includes('_color')) {
                            (c as Picture | Anim).tint = personMembersArray[index].colorPerson;
                        }
                    });
                }
                if (playerTransport === 'rat') {
                    transportContainer.children.forEach((c) => {
                        if (c.nickname.includes('_color')) {
                            if (c.nickname.includes('_color2')) {
                                (c as Picture | Anim).tint = [0xcc5500, 0x082567, 0x008080][Math.floor(Math.random() * 3)];
                            } else if (c.nickname.includes('_color3')) {
                                (c as Picture | Anim).tint = [0xaac688, 0xbdb76b, 0xaddfad][Math.floor(Math.random() * 3)];
                            } else {
                                (c as Picture | Anim).tint = personMembersArray[index].colorPersonint;
                            }
                        }
                    });
                }
                this.animatePlayer(playerTransport, transportContainer);
                this.scene.addPlayerIcon(personMembersArray[index], index, playerTransport, transportContainer);

            }
        }
    }

    animatePlayer(playerTransport: string, transportContainer: Container): void {
        if (playerTransport === 'quadro') {
            this.startPlayerMove(transportContainer.nickname);
        }
    }

    getPlayerPositions(n: number): IPoint[] {
        if (n === 1) {
            return this.getPlayerPosition1();
        }
        if (n === 2) {
            return this.getPlayerPosition2();
        }
        if (n === 3) {
            return this.getPlayerPosition3();
        } else {
            return this.getPlayerPosition4();
        }
    }

    getPlayerPosition1(): IPoint[] {
        return [];
    }

    getPlayerPosition2(): IPoint[] {
        return [
            {x: 720, y: 420}
        ];
    }

    getPlayerPosition3(): IPoint[] {
        return [
            {x: 800, y: 400},
            {x: 600, y: 400}
        ];
    }

    getPlayerPosition4(): IPoint[] {
        return [
            {x: 800, y: 400},
            {x: 700, y: 350},
            {x: 600, y: 400}
        ];
    }

    startPlayerMove(nameContainer: string): void {
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