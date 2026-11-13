const KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const ROOT_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID;

if (!KEY || !ROOT_FOLDER_ID) {
  throw new Error('Set VITE_GOOGLE_API_KEY and VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID in .env.local');
}

async function rootFolders(FOLDER_ID = ROOT_FOLDER_ID ) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&fields=files(id,name,mimeType,webViewLink,modifiedTime)&key=${KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files;
}

const icons = {
    folder: new URL('../../../assets/images/icon/folder-regular.png', import.meta.url).href,
    files: new URL('../../../assets/images/icon/file-regular.png', import.meta.url).href
}

const postContainer = document.querySelector('#drive .post');
const loadWindow = document.querySelector('#menu-assignment')

let windowState = false;
const driveWindow = document.querySelector('#drive');
if(!windowState) {
    driveWindow.style.display = 'none';
}

loadWindow.addEventListener('click', function() {
    windowState = !windowState;
    if (windowState) {
        driveWindow.style.display = 'block';
    } else {
        driveWindow.style.display = 'none';
    }
});

const folderHistory = [ROOT_FOLDER_ID];

async function loadDrive(folderId = ROOT_FOLDER_ID) {
    if (!postContainer) return;
    const rawItems = await rootFolders(folderId);

    if (!rawItems || rawItems.length === 0) {
        const backbtn = folderHistory.length > 1 ? `<div class="backbtn"><</div>` : '';
        postContainer.innerHTML = `${backbtn}`;
        attachEvents();
        return;
    }

    const fetchItems = rawItems.map(item => {
        const dataType = item.mimeType === 'application/vnd.google-apps.folder'

        let typeIcons = '';
        if(dataType){
            typeIcons =`<img class="ico" src="${icons.folder}">`
        } else {
            typeIcons = `<img class="ico" src="${icons.files}">`;
        }

        let formattedDate = '';
        if (item.modifiedTime) {
            const dateObj = new Date(item.modifiedTime);
            const dateStr = dateObj.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            });
            const timeStr = dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            formattedDate = `${dateStr} ${timeStr}`;
        }

        const mod = `<span class="date-modified">${formattedDate}</span>`;

        return {
            nama: item.name,
            id: item.id,
            link: item.webViewLink,
            type: dataType,
            elementIcons: typeIcons,
            modified: mod,
        };
    });

    const items = fetchItems.map(item => 
        `<div class="drive-files" id="${item.id}" data-type="${item.type}" data-link="${item.link}">${item.elementIcons} ${item.nama} ${item.modified}</div>`
    ).join(' ');

    const backbtn = folderHistory.length > 1 ? `<div class="backbtn">&lt;</div>` : '';

    postContainer.innerHTML = `${backbtn}${items}`;

    attachEvents();
}

let isLoading = false;

function attachEvents() {
    if (!postContainer) return;

    const backBtnElement = postContainer.querySelector('.backbtn');
    if (backBtnElement) {
        backBtnElement.addEventListener('click', async function () {
            if (isLoading || folderHistory.length <= 1) return;
            isLoading = true;
            try {
                folderHistory.pop();
                await loadDrive(folderHistory[folderHistory.length - 1]);
            } finally {
                isLoading = false;
            }
        });
    }

    const driveElements = postContainer.querySelectorAll('.drive-files');
    driveElements.forEach(element => {
        element.addEventListener('click', async function () {
            if (isLoading) return;

            if (this.dataset.type === 'true') {
                isLoading = true;
                try {
                    folderHistory.push(this.id);
                    await loadDrive(this.id);
                } finally {
                    isLoading = false;
                }
            } else {
                window.open(this.dataset.link, '_blank', 'noopener,noreferrer');
            }
        });
    });
}

loadDrive();