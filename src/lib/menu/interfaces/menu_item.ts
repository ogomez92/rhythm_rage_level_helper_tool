export default interface MenuItem {
    getID(): string;
    destroy(): void;
    focus(): void;
    unfocus(): void;
    getHelpText(): string;
    getShortcut(): string;
    isSelectable(): boolean;
}
