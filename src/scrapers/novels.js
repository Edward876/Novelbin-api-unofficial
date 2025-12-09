const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://novelbin.me';

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});

async function scrapePopularNovels() {
    try {
        const { data } = await axiosInstance.get(BASE_URL);
        const $ = cheerio.load(data);
        
        const novels = [];
        $('.index-novel .item').each((i, el) => {
            const titleEl = $(el).find('.title h3');
            const linkEl = $(el).find('a').first();
            const imgEl = $(el).find('img');
            
            const title = titleEl.text().trim();
            const url = linkEl.attr('href');
            const id = url ? url.split('/').pop() : null;
            const cover = imgEl.attr('data-src') || imgEl.attr('src');

            if (title) {
                novels.push({ 
                    title, 
                    url: url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : null, 
                    id, 
                    cover 
                });
            }
        });
        
        return novels;
    } catch (error) {
        console.error('Error scraping popular novels:', error);
        throw error;
    }
}

async function scrapeLatestNovels() {
    try {
        const { data } = await axiosInstance.get(BASE_URL);
        const $ = cheerio.load(data);
        
        const novels = [];
        $('.list-new .row').each((i, el) => {
            const titleEl = $(el).find('.col-title a');
            const genreEl = $(el).find('.col-genre a');
            const chapterEl = $(el).find('.col-chapter a');
            
            const title = titleEl.text().trim();
            const url = titleEl.attr('href');
            
            if (title) {
                novels.push({
                    title,
                    url: url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : null,
                    id: url ? url.split('/').pop() : null,
                    genre: genreEl.text().trim(),
                    latestChapter: chapterEl.text().trim()
                });
            }
        });
        
        return novels;
    } catch (error) {
        console.error('Error scraping latest novels:', error);
        throw error;
    }
}

async function scrapeSearch(keyword) {
    try {
        const searchUrl = `${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`;
        const { data } = await axiosInstance.get(searchUrl);
        const $ = cheerio.load(data);
        
        const novels = [];
        $('.list-novel .row').each((i, el) => {
            const titleEl = $(el).find('.novel-title a');
            const authorEl = $(el).find('.author');
            const imgEl = $(el).find('img.cover');
            
            const title = titleEl.text().trim();
            const url = titleEl.attr('href');
            
            if (title) {
                novels.push({
                    title,
                    url: url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : null,
                    id: url ? url.split('/').pop() : null,
                    author: authorEl.text().trim(),
                    cover: imgEl.attr('data-src') || imgEl.attr('src')
                });
            }
        });
        
        return novels;
    } catch (error) {
        console.error('Error scraping search results:', error);
        throw error;
    }
}

async function scrapeNovelDetails(id) {
    try {
        const url = `${BASE_URL}/novel-book/${id}`;
        const { data } = await axiosInstance.get(url);
        const $ = cheerio.load(data);
        
        const title = $('h3.title').text().trim();
        const imgEl = $('.book img');
        const cover = imgEl.attr('data-src') || imgEl.attr('src');
        const description = $('.desc-text').text().trim();
        
        const getMeta = (label) => {
            const li = $('ul.info li').filter((i, el) => $(el).text().includes(label));
            if (li.length) {
                const value = li.find('a').text().trim();
                if (value) return value;
                return li.text().replace(label, '').trim();
            }
            return null;
        };

        const getMetaFallback = (label) => {
             const labelEl = $('h3').filter((i, el) => $(el).text().includes(label));
             if (labelEl.length) {
                 const next = labelEl.next();
                 if (next.length && next.text().trim()) return next.text().trim();
                 return labelEl.parent().text().replace(label, '').trim();
             }
             return null;
        }

        const author = getMeta('Author:') || getMetaFallback('Author:');
        const status = getMeta('Status:') || getMetaFallback('Status:');
        const publishers = getMeta('Publishers:') || getMetaFallback('Publishers:');
        const year = getMeta('Year of publishing:') || getMetaFallback('Year of publishing:');
        
        const genres = [];
        $('.categories a').each((i, el) => {
            genres.push($(el).text().trim());
        });

        const chapters = [];
        $('ul.list-chapter li a').each((i, el) => {
            const link = $(el);
            const href = link.attr('href');
            chapters.push({
                title: link.text().trim(),
                id: href ? href.split('/').pop() : null,
                url: href
            });
        });

        return { 
            title, 
            author, 
            description, 
            cover, 
            genres, 
            status, 
            publishers, 
            year, 
            id, 
            chapters 
        };
    } catch (error) {
        console.error(`Error scraping novel details for ${id}:`, error);
        throw error;
    }
}

async function scrapeChapterContent(novelId, chapterId) {
    try {
        const url = `${BASE_URL}/novel-book/${novelId}/${chapterId}`;
        const { data } = await axiosInstance.get(url);
        const $ = cheerio.load(data);
        
        const title = $('.chr-title').text().trim();
        const contentEl = $('#chr-content');
        
        let content = '';
        if (contentEl.find('p').length > 0) {
             contentEl.find('p').each((i, el) => {
                 content += $(el).text().trim() + '\n\n';
             });
        } else {
            content = contentEl.text().trim();
        }

        return { 
            title, 
            content: content.trim(), 
            novelId, 
            chapterId 
        };
    } catch (error) {
        console.error(`Error scraping chapter content for ${novelId}/${chapterId}:`, error);
        throw error;
    }
}

module.exports = {
    scrapePopularNovels,
    scrapeLatestNovels,
    scrapeSearch,
    scrapeNovelDetails,
    scrapeChapterContent
};
