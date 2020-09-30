const BaseSpider = require('./base');

class ToutiaoSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    const footerContent = `<br><b>本篇文章由一文多发平台ArtiPub自动发布</b>. https://github.com/crawlab-team/artipub`;
    const content = article.contentHtml + footerContent;
    const el = document.querySelector(editorSel.content);
    el.focus();
    document.execCommand('insertHTML', false, content);
  }

  async inputTitle(article, editorSel, task) {
    document.querySelector(editorSel.title).focus();
    document.querySelector(editorSel.title).click();
    document.execCommand('insertText', false, article.title);
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }


  async publish() {
    // 发布文章
    const elPub = await this.page.$(this.editorSel.publish);
    await elPub.click();
    await this.page.waitFor(10000);

    // 后续处理
    await this.afterPublish();
  }

  async afterInputEditor() {
    await this.page.evaluate(() => {
      const el = document.querySelectorAll('.article-cover-radio-group > label > span');
      el[2].click();
    });

    await this.page.evaluate(() => {
      const el = document.querySelectorAll('.byte-radio-mode-outline > label > span');
      el[0].click();
    });
  }

  async afterPublish() {
    const id = await this.page.evaluate(() => {
      const url = document.querySelector('.title-wrap > a').getAttribute('href');
      return url.match(/pgc_id=(\d+)$/)[1];
    });
    if (!id) return;
    this.task.url = `https://toutiao.com/i${id}`;
    this.task.updateTs = new Date();
    await this.task.save();
  }

  async fetchStats() {
  }
}

module.exports = ToutiaoSpider;
