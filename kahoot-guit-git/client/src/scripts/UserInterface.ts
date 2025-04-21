export function openNav(): void {
    const sideNav = document.getElementById("sidenav") as HTMLElement | null;
    if (sideNav) {
        sideNav.style.width = "250px";
    }
}

export function closeNav(): void {
    const sideNav = document.getElementById("sidenav") as HTMLElement | null;
    if (sideNav) {
        sideNav.style.width = "0";
    }
}

export function toggleShow(): void {
    const statusBox = document.getElementById("status") as HTMLElement | null;
    if (statusBox) {
        statusBox.style.display = statusBox.style.display === "none" ? "block" : "none";
    }
}

export function openSettings(): void {
    const settingsPanel = document.getElementById("settings") as HTMLElement | null;
    if (settingsPanel) {
        settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
        window.location.hash = "#settings";
    }
}

export function disableNameInput(disable: boolean): void {
    const nameInput = document.getElementById("name-input") as HTMLInputElement | null;
    if (nameInput) {
        if (disable) {
            nameInput.value =
                "You chose to enter a list of names. You can leave this blank.";
        }
        nameInput.disabled = disable;
    }
}
