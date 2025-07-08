import JSZip from "jszip";

function escapeHTML(str) {
    return String(str)
        .replace(/<[^>]*>/g, "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/(\([^\(\)]+\))/g, "<i>$1</i>");
}

function parseContent(json) {
    let out = '';
    let chapterCount = 0
    for (const chapter of json.chapters) {
        let questions = chapter.params.content[0].content.params.questions;
        let chapterName = chapter.metadata.title;
        if (!questions) continue;

        chapterCount++;
        out += `<h1>Chapter ${escapeHTML(chapterCount)} : ${escapeHTML(chapterName)}</h1>`

        for (const question of questions) {
            let questiontxt = question.params.question;
            if (questiontxt) {
                out += `<h3>${escapeHTML(questiontxt)}</h3>`;

                const answers = question.params.answers;
                for (const answer of answers) {
                    let answertxt = answer.text;
                    const color = (answer.correct) ? 'green' : 'red';
                    out += `<p class=${color}>${escapeHTML(answertxt)}</p>`;
                }
            }
        }
    }

    document.getElementById('output').innerHTML = out;
}


document.getElementById('h5pFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const output = document.getElementById('output');

    try {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        const targetPath = "content/content.json";

        if (zip.files[targetPath]) {
            const text = await zip.files[targetPath].async("text");
            const json = JSON.parse(text);
            parseContent(json)
        } else {
            output.textContent = `⚠️ File not found: ${targetPath}`;
        }

    } catch (err) {
        console.error(err);
        output.textContent = "Error reading H5P file: " + err.message;
    }
});