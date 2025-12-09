const { getPage } = require('../browser');

const BASE_URL = 'https://novelbin.me';

async function scrapePopularNovels() {
    const page = await getPage();
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Wait for selector to ensure content is loaded
        try {
            await page.waitForSelector('.index-novel .item', { timeout: 5000 });
        } catch (e) {
            console.log('Selector .index-novel .item not found');
        }

        const novels = await page.$$eval('.index-novel .item', items => items.map(i => {
            const titleEl = i.querySelector('.title h3');
            const linkEl = i.querySelector('a');
            const imgEl = i.querySelector('img');
            return {
                title: titleEl?.innerText?.trim(),
                url: linkEl?.href,
                id: linkEl?.href?.split('/').pop(),
                cover: imgEl?.getAttribute('data-src') || imgEl?.src
            };
        }));
        
        return novels.filter(n => n.title);
    } catch (error) {
        console.error('Error scraping popular novels:', error);
        throw error;
    } finally {
        await page.close();
    }
}

async function scrapeLatestNovels() {
    const page = await getPage();
    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const novels = await page.$$eval('.list-new .row', items => items.map(i => {
            const titleEl = i.querySelector('.col-title a');
            const genreEl = i.querySelector('.col-genre a');
            const chapterEl = i.querySelector('.col-chapter a');
            return {
                title: titleEl?.innerText?.trim(),
                url: titleEl?.href,
                id: titleEl?.href?.split('/').pop(),
                genre: genreEl?.innerText?.trim(),
                latestChapter: chapterEl?.innerText?.trim()
            };
        }));
        
        return novels.filter(n => n.title);
    } catch (error) {
        console.error('Error scraping latest novels:', error);
        throw error;
    } finally {
        await page.close();
    }
}

async function scrapeSearch(keyword, pageNum = 1) {
    const page = await getPage();
    try {
        const searchUrl = `${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`; // Pagination might be needed if supported
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const novels = await page.$$eval('.list-novel .row', items => items.map(i => {
            const titleEl = i.querySelector('.novel-title a');
            const authorEl = i.querySelector('.author');
            const imgEl = i.querySelector('img.cover');
            return {
                title: titleEl?.innerText?.trim(),
                url: titleEl?.href,
                id: titleEl?.href?.split('/').pop(),
                author: authorEl?.innerText?.trim(),
                cover: imgEl?.getAttribute('data-src') || imgEl?.src
            };
        }));
        
        return novels.filter(n => n.title);
    } catch (error) {
        console.error('Error scraping search results:', error);
        throw error;
    } finally {
        await page.close();
    }
}

async function scrapeNovelDetails(id) {
    const page = await getPage();
    try {
        const url = `${BASE_URL}/novel-book/${id}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const details = await page.evaluate(() => {
            const title = document.querySelector('h3.title')?.innerText?.trim();
            const imgEl = document.querySelector('.book img');
            const cover = imgEl?.getAttribute('data-src') || imgEl?.src;
            const description = document.querySelector('.desc-text')?.innerText?.trim();
            
            // Helper to find metadata by label
            const getMeta = (label) => {
                const h3s = Array.from(document.querySelectorAll('h3'));
                const labelH3 = h3s.find(h => h.innerText.includes(label));
                if (labelH3) {
                    // Try next sibling
                    let next = labelH3.nextElementSibling;
                    if (next) return next.innerText?.trim();
                    // Or maybe it's inside the same parent's text?
                    // Or maybe it's a list item?
                    return labelH3.parentElement?.innerText?.replace(label, '').trim();
                }
                return null;
            };

            const author = getMeta('Author:');
            const status = getMeta('Status:');
            const publishers = getMeta('Publishers:');
            const year = getMeta('Year of publishing:');
            const genres = Array.from(document.querySelectorAll('.categories a')).map(a => a.innerText?.trim());

            return { title, author, description, cover, genres, status, publishers, year };
        });

        // Get chapters
        const chapters = await page.$$eval('ul.list-chapter li a', links => links.map(l => ({
            title: l.innerText?.trim(),
            id: l.href.split('/').pop(),
            url: l.href
        })));

        return { ...details, id, chapters };
    } catch (error) {
        console.error(`Error scraping novel details for ${id}:`, error);
        throw error;
    } finally {
        await page.close();
    }
}

async function scrapeChapterContent(novelId, chapterId) {
    const page = await getPage();
    try {
        const url = `${BASE_URL}/novel-book/${novelId}/${chapterId}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const content = await page.evaluate(() => {
            const title = document.querySelector('.chr-title')?.innerText?.trim();
            const contentEl = document.querySelector('#chr-content');
            
            // Remove ads or unwanted elements if necessary
            // contentEl.querySelectorAll('.ads').forEach(e => e.remove());
            
            return {
                title,
                content: contentEl?.innerText // or innerHTML if we want formatting
            };
        });

        return { ...content, novelId, chapterId };
    } catch (error) {
        console.error(`Error scraping chapter content for ${novelId}/${chapterId}:`, error);
        throw error;
    } finally {
        await page.close();
    }
}

module.exports = {
    scrapePopularNovels,
    scrapeLatestNovels,
    scrapeSearch,
    scrapeNovelDetails,
    scrapeChapterContent
};
