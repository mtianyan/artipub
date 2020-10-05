window.MAIN = {
  ChromeService: {
    testConnect(e) {
      e.success({});
    },
    testOrigin(e, t) {
      fetch(t.url)
        .then(t => e.success(t.status < 400));
    },
    permissions(e) {
      chrome.permissions.getAll(t => e.success(t));
    },
    getManifest(e) {
      e.success(chrome.runtime.getManifest());
    },
  },
  CookieService: {
    getCookie: (e, t) => {
      chrome.cookies.getAll({ url: t }, t => {
        e.send(CookieUtils.obj2str(t));
      });
    },
  },
  ChannelService: {
    aijishu: {
      verifyCookie: e => {
        fetch('https://aijishu.com/user/settings', { method: 'GET' })
          .then(t => {
            e.success(!t.redirected);
          });
      },
      verifyChannelConfig: (e, t) => {
        (!t.tags || t.tags.length < 1) && e.error('必须选择标签'), t.tags.length > 5 && e.error('标签数量不能超过 5 个'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = t.config;
        MAIN.ChannelService.aijishu.token('https://aijishu.com/write')
          .then(t => {
            let o = s.content.match(/!\[.*?]\((.*?)\)/g);
            Promise.resolve()
              .then(() => o ? o.reduce((n, o) => {
                let a = /!\[.*?]\((.*?)\)/.exec(o)[1];
                return a.startsWith('http') ? n.then(() => fetch(a)
                  .then(e => e.blob())
                  .then(e => {
                    let n = new FormData;
                    return n.append('image', e, 'image.png'), fetch(`https://aijishu.com/api/storage/image?csrf=${t}`, {
                      method: 'POST',
                      body: n,
                    })
                      .then(e => e.json())
                      .then(e => {
                        s.content = s.content.split(a)
                          .join(e.data);
                      });
                  })
                  .catch(() => e.error(`发布失败，图片不支持跨域 ${a}`))) : n.then(() => Promise.resolve());
              }, Promise.resolve()) : Promise.resolve())
              .then(() => {
                let o = new FormData;
                o.append('title', s.title), o.append('text', s.content), o.append('tags', String(n.tags)), o.append('blogId', '0'), fetch(`https://aijishu.com/api/article/add?aff=openwrite&csrf=${t}`, {
                  method: 'POST',
                  headers: { 'X-Requested-With': 'XMLHttpRequest' },
                  body: o,
                })
                  .then(e => e.json())
                  .then(t => {
                    0 === t.status ? fetch('https://aijishu.com/referer')
                      .then(t => {
                        e.success(t.url);
                      }) : e.error(JSON.stringify(t));
                  });
              });
          });
      },
      articleDelete: (e, t) => {
        fetch(t.url)
          .then(s => {
            if (200 === s.status) {
              let s = t.url.split('/')
                .shift();
              MAIN.ChannelService.aijishu.token(t.url)
                .then(t => {
                  fetch(`https://aijishu.com/api/article/${s}/delete?_=${t}`, { method: 'POST' })
                    .then(e => e.json())
                    .then(t => {
                      e.success(t.data);
                    });
                });
            } else {
              403 === s.status && e.success(!0);
            }
          });
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html'),
              n = s.querySelector('body > div.container.position-relative > div > div.col-lg-1.handle-bar.text-center.d-none.d-lg-block > div:nth-child(1) > div').textContent,
              o = s.querySelector('body > div.container.position-relative > div > div.col-lg-8 > div:nth-child(1) > div > div.handle-bar.text-secondary.d-flex.align-items-center.justify-content-between.mt-4 > div:nth-child(1) > span')
                .textContent
                .replace('阅读', '')
                .trim(),
              a = s.querySelector('body > div.container.position-relative > div > div.col-lg-8 > h5:nth-child(4)')
                .textContent
                .replace('评论', '')
                .replace('条', '')
                .trim();
            e.success({
              read: o,
              like: n,
              comment: a,
            });
          });
      },
      getConfig: e => {
        fetch(`https://aijishu.com/api/tag/default`)
          .then(e => e.json())
          .then(t => {
            t = t.data;
            let s = {};
            for (let e in t) {
              let n = [];
              t[e].forEach(e => n.push({
                key: e.name,
                value: e.id,
              })), s[e] = n;
            }
            e.success({ category: s });
          })
          .catch(() => e.error(`Network Error`));
      },
      token: url => fetch(url)
        .then(e => e.text())
        .then(html => {
          let token = eval(/w.GLOBAL.token = ([\s\S]*?);;/.exec(html)[1]);
          return isEmpty(token) ? Promise.reject('Failed fetch global token') : token;
        }),
    },
    cnblogs: {
      verifyCookie: e => {
        fetch('https://account.cnblogs.com/api/user/info')
          .then(t => {
            e.success(200 === t.status);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.publishType) && e.error('发布选项必填'), isEmpty(t.siteCategory) && e.error('系统分类必填'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = t.config;
        MAIN.ChannelService.cnblogs.blogId('https://i-beta.cnblogs.com/api/user')
          .then(t => {
            let o = s.content.match(/!\[.*?]\((.*?)\)/g);
            Promise.resolve()
              .then(() => o ? o.reduce((t, n) => {
                let o = /!\[.*?]\((.*?)\)/.exec(n)[1];
                return o.startsWith('http') ? t.then(() => fetch(o)
                  .then(e => e.blob())
                  .then(e => {
                    let t = new FormData;
                    return t.append('imageFile', e, 'image.png'), fetch(`https://upload.cnblogs.com/imageuploader/CorsUpload`, {
                      method: 'POST',
                      headers: { uploadType: 'Paste' },
                      body: t,
                    })
                      .then(e => e.json())
                      .then(e => {
                        e.success && (s.content = s.content.split(o)
                          .join(e.message));
                      });
                  })
                  .catch(() => e.error(`发布失败，图片不支持跨域 ${o}`))) : t.then(() => Promise.resolve());
              }, Promise.resolve()) : Promise.resolve())
              .then(() => {
                let o = {
                  id: null,
                  postType: 1,
                  title: s.title,
                  url: null,
                  postBody: s.content,
                  categoryIds: s.categories,
                  inSiteCandidate: '00' === n.publishType,
                  inSiteHome: '01' === n.publishType,
                  siteCategoryId: parseInt(n.siteCategory),
                  blogTeamIds: [],
                  isPublished: n.ckbPublished,
                  displayOnHomePage: n.chkDisplayHomePage,
                  isAllowComments: n.chkComments,
                  includeInMainSyndication: n.chkMainSyndication,
                  isPinned: !1,
                  isOnlyForRegisterUser: n.chkIsOnlyForRegisterUser,
                  isUpdateDateAdded: !1,
                  entryName: null,
                  description: '',
                  tags: n.txbTag.split(','),
                  password: null,
                  datePublished: TimeUtils.format('YYYY-mm-ddTHH:MM:SS.sssZ', new Date),
                  isMarkdown: !0,
                  isDraft: !1,
                  autoDesc: '',
                  changePostType: !1,
                  blogId: parseInt(t),
                  author: null,
                  removeScript: !1,
                  ip: null,
                  changeCreatedTime: !1,
                  canChangeCreatedTime: !1,
                };
                fetch(`https://i-beta.cnblogs.com/api/posts`, {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                    'x-blog-id': t,
                  },
                  body: JSON.stringify(o),
                })
                  .then(e => e.json())
                  .then(t => {
                    t.errors && t.errors.length > 0 ? e.error(JSON.stringify(t.errors)) : e.success(`https:${t.url}`);
                  });
              });
          });
      },
      articleDelete: (e, t) => {
        fetch(t.url)
          .then(s => {
            if (200 === s.status) {
              let s = t.url.split('/'),
                n = s[s.length - 1].replace('.html', '');
              fetch(`https://i.cnblogs.com/post/delete`, {
                method: 'POST',
                headers: JSON_HEADER,
                body: JSON.stringify({ postId: n }),
              })
                .then(e => e.json())
                .then(t => {
                  e.success(t.data);
                });
            } else {
              404 === s.status && e.success(!0);
            }
          });
      },
      articleData: (e, t) => {
        let s = t.url.split('/'),
          n = s[s.length - 1].replace('.html', ''),
          o = s[s.length - 3];
        fetch(t.url)
          .then(t => {
            if (200 === t.status) {
              return fetch(`https://www.cnblogs.com/${o}/ajax/GetViewCount.aspx?postId=${n}`)
                .then(e => e.text())
                .then(t => {
                  fetch(`https://www.cnblogs.com/${o}/ajax/GetCommentCount.aspx?postId=${n}&_=${(new Date).getTime()}`)
                    .then(e => e.text())
                    .then(s => {
                      e.success({
                        read: t,
                        like: 0,
                        comment: s,
                      });
                    });
                }), t.text();
            }
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          });
      },
      getConfig: e => {
        fetch(`https://i-beta.cnblogs.com/api/category/blog/1/edit`)
          .then(e => e.json())
          .then(t => {
            let s = [];
            t.forEach(e => {
              s.push({
                key: e.title,
                value: e.categoryId,
              });
            }), fetch('https://i-beta.cnblogs.com/api/category/site')
              .then(e => e.json())
              .then(t => {
                let n = {};
                t.forEach(e => {
                  let t = [];
                  e.children.forEach(e => {
                    t.push({
                      key: e.title,
                      value: String(e.id),
                    });
                  }), n[e.title] = t;
                }), e.success({
                  category: s,
                  siteCategory: n,
                });
              });
          });
      },
      blogId: e => fetch(e)
        .then(e => e.json())
        .then(e => e.blogId),
    },
    csdn: {
      verifyCookie: e => {
        fetch('https://blog-console-api.csdn.net/v1/user/info')
          .then(t => {
            e.success(200 === t.status);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.type) && e.error('请先配置「文章类型」'), isEmpty(t.csdnReadTypeRadios) && e.error('请先配置「发布形式」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = t.config,
          o = s.content.match(/!\[.*?]\((.*?)\)/g);
        Promise.resolve()
          .then(() => o ? o.reduce((t, n) => {
            let o = /!\[.*?]\((.*?)\)/.exec(n)[1];
            return o.startsWith('http') ? t.then(() => fetch(o)
              .then(e => e.blob())
              .then(e => {
                let t = new FormData;
                return t.append('file', e, 'image.png'), fetch(`https://blog-console-api.csdn.net/v1/upload/img?shuiyin=1`, {
                  method: 'POST',
                  body: t,
                })
                  .then(e => e.json())
                  .then(e => {
                    200 === e.code && (s.content = s.content.split(o)
                      .join(e.data.url));
                  });
              })
              .catch(() => e.error(`发布失败，图片不支持跨域 ${o}`))) : t.then(() => Promise.resolve());
          }, Promise.resolve()) : Promise.resolve())
          .then(() => {
            let t = {
              id: null,
              title: s.title,
              markdowncontent: s.content,
              content: marked(s.content),
              readType: n.readType,
              tags: '',
              status: 0,
              categories: n.myCategory ? String(n.myCategory) : '',
              type: n.type,
              original_link: n.original_link,
              authorized_status: !1,
              not_auto_saved: '0',
              source: 'pc_mdeditor',
            };
            n.original_plan && (t.original_plan = 2), fetch(`https://blog-console-api.csdn.net/v1/mdeditor/saveArticle`, {
              method: 'POST',
              headers: JSON_HEADER,
              body: JSON.stringify(t),
            })
              .then(e => e.json())
              .then(t => {
                200 === t.code ? e.success(t.data.url) : e.error(t.msg);
              });
          });
      },
      articleDelete: (e, t) => {
        fetch(t.url)
          .then(s => {
            if (200 === s.status) {
              let s = t.url.split('/'),
                n = s[s.length - 1];
              fetch(`https://blog-console-api.csdn.net/v1/article/del`, {
                method: 'POST',
                headers: JSON_HEADER,
                body: JSON.stringify({
                  article_id: n,
                  deep: 'false',
                }),
              })
                .then(e => e.json())
                .then(t => {
                  e.success(200 === t.code);
                });
            } else {
              404 === s.status && e.success(!0);
            }
          });
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html'),
              n = s.querySelector('span.read-count')
                .textContent
                .replace('阅读数', '')
                .trim(),
              o = s.querySelector('#blog_detail_zk_collection .get-collection')
                .innerHTML
                .trim(),
              a = s.querySelectorAll('.comment-list li').length;
            e.success({
              read: n,
              like: o || 0,
              comment: a || 0,
            });
          });
      },
      getConfig: e => {
        fetch(`https://blog-console-api.csdn.net/v1/editor/getBaseInfo`)
          .then(e => e.json())
          .then(t => {
            let s = [];
            t.data.categorys.forEach(e => {
              s.push({
                key: e,
                value: e,
              });
            }), e.success({ myCategory: s });
          });
      },
    },
    imooc: {
      verifyCookie: e => {
        fetch('https://www.imooc.com/user/setprofile')
          .then(t => {
            e.success(!t.redirected);
          });
      },
      verifyChannelConfig: e => {
        e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = s.content.match(/!\[.*?]\((.*?)\)/g);
        Promise.resolve()
          .then(() => n ? n.reduce((t, n) => {
            let o = /!\[.*?]\((.*?)\)/.exec(n)[1];
            return o.startsWith('http') ? t.then(() => fetch(`https://www.imooc.com/wenda/uploadimg`, {
              method: 'POST',
              headers: X_FORM_HEADER,
              body: `imgs[]=${o}`,
            })
              .then(e => 200 === e.status && e.json())
              .then(e => {
                e && (s.content = s.content.split(o)
                  .join(e[0].url.replace('http:', 'https:')));
              })
              .catch(() => e.error(`发布失败，图片不支持跨域 ${o}`))) : t.then(() => Promise.resolve());
          }, Promise.resolve()) : Promise.resolve())
          .then(() => {
            fetch(`https://www.imooc.com/article/savedraft`, {
              method: 'POST',
              headers: X_FORM_HEADER,
              body: `editor=0&content=${encodeURIComponent(s.content)}&title=${encodeURIComponent(s.title)}&draft_id=0`,
            })
              .then(e => e.json())
              .then(t => {
                0 === t.result ? e.success(`https://www.imooc.com/article/draft/id/${t.data}#`) : e.error(JSON.stringify(t));
              });
          });
      },
      articleDelete: e => {
        e.success(!0);
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html'),
              n = s.querySelector('span.spacer-2')
                .textContent
                .replace('浏览', '')
                .trim(),
              o = s.querySelector('.num-person .num')
                .textContent
                .trim(),
              a = s.querySelector('#all_comments .comment-num i')
                .textContent
                .trim();
            e.success({
              read: n || 0,
              like: o || 0,
              comment: a || 0,
            });
          });
      },
      getConfig: e => {
        e.success({});
      },
    },
    jianshu: {
      verifyCookie: e => {
        fetch('https://www.jianshu.com/settings/reward-setting.json')
          .then(t => e.success(200 === t.status));
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.notebook_id) && e.success('请先配置「文集」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = t.config;
        MAIN.ChannelService.jianshu.csrf(`https://www.jianshu.com/settings/basic`)
          .then(t => {
            fetch('https://www.jianshu.com/settings', {
              method: 'PUT',
              headers: {
                'content-type': 'application/json',
                'X-CSRF-Token': t,
              },
              body: JSON.stringify({ preferred_note_type: 'markdown' }),
            })
              .then(() => {
                let o = s.content.match(/!\[.*?]\((.*?)\)/g);
                Promise.resolve()
                  .then(() => o ? o.reduce((t, n) => {
                    let o = /!\[.*?]\((.*?)\)/.exec(n)[1];
                    return o.startsWith('http') ? t.then(() => fetch(o)
                      .then(e => e.blob())
                      .then(e => fetch('https://www.jianshu.com/upload_images/token.json?filename=image.png')
                        .then(e => e.json())
                        .then(t => {
                          let n = new FormData;
                          return n.append('file', e, 'image.png'), n.append('x:protocol', 'https'), n.append('token', t.token), n.append('key', t.key), fetch(`https://upload.qiniup.com/`, {
                            method: 'POST',
                            body: n,
                          })
                            .then(e => e.json())
                            .then(e => {
                              e.url && (s.content = s.content.split(o)
                                .join(e.url));
                            });
                        }))
                      .catch(() => e.error(`发布失败，图片不支持跨域 ${o}`))) : t.then(() => Promise.resolve());
                  }, Promise.resolve()) : Promise.resolve())
                  .then(() => {
                    fetch(`https://www.jianshu.com/author/notes`, {
                      method: 'POST',
                      headers: {
                        'content-type': 'application/json',
                        'X-CSRF-Token': t,
                      },
                      body: JSON.stringify({
                        notebook_id: n.notebook_id,
                        title: s.title,
                        at_bottom: !1,
                      }),
                    })
                      .then(e => e.json())
                      .then(n => {
                        fetch(`https://www.jianshu.com/author/notes/${n.id}`, {
                          method: 'PUT',
                          headers: {
                            'content-type': 'application/json',
                            'X-CSRF-Token': t,
                          },
                          body: JSON.stringify({
                            id: n.id,
                            autosave_control: 1,
                            title: s.title,
                            content: s.content,
                          }),
                        })
                          .then(e => e.json())
                          .then(() => {
                            fetch(`https://www.jianshu.com/author/notes/${n.id}/publicize`, {
                              method: 'POST',
                              headers: {
                                'content-type': 'application/json',
                                'X-CSRF-Token': t,
                              },
                            })
                              .then(e => e.json())
                              .then(t => {
                                t.error ? e.error(JSON.stringify(t.error)) : e.success(`https://www.jianshu.com/p/${n.slug}`);
                              });
                          });
                      });
                  });
              });
          })
          .catch(t => e.error(t));
      },
      articleDelete: (e, t) => {
        MAIN.ChannelService.jianshu.csrf(`https://www.jianshu.com/settings/basic`)
          .then(s => {
            fetch(t.url)
              .then(e => e.text())
              .then(e => {
                let t = (new DOMParser).parseFromString(e, 'text/html')
                  .querySelector('meta[property="al:ios:url"]')
                  .getAttribute('content')
                  .replace('jianshu://notes/', '');
                fetch(`https://www.jianshu.com/author/notes/${t}/soft_destroy`, {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                    'X-CSRF-Token': s,
                  },
                });
              })
              .catch(e => console.log(e))
              .finally(() => e.success(!0));
          });
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html'),
              n = JSON.parse(s.getElementById('__NEXT_DATA__').textContent),
              o = n.props.initialState.note.data.views_count,
              a = n.props.initialState.note.data.likes_count,
              r = n.props.initialState.note.data.comments_count;
            e.success({
              read: o,
              like: a,
              comment: r,
            });
          });
      },
      getConfig: e => {
        fetch(`https://www.jianshu.com/author/notebooks`)
          .then(e => e.json())
          .then(t => {
            e.success({ notebooks: t });
          });
      },
      csrf: e => fetch(e)
        .then(e => e.text())
        .then(e => {
          let t = (new DOMParser).parseFromString(e, 'text/html')
            .querySelector('meta[name=csrf-token]')
            .getAttribute('content');
          return isEmpty(t) ? Promise.reject('Failed fetch csrf-token') : t;
        }),
    },
    juejinOld: {
      verifyCookie: e => {
        fetch(`https://juejin.im/auth`)
          .then(t => {
            e.success(200 === t.status);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.category) && e.success('请先配置「分类」'), isEmpty(t.tags) && e.success('请先配置「标签」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = t.config;
        MAIN.ChannelService.juejin.auth()
          .then(t => {
            let o = s.content.match(/!\[.*?]\((.*?)\)/g);
            Promise.resolve()
              .then(() => o ? o.reduce((t, n) => {
                let o = /!\[.*?]\((.*?)\)/.exec(n)[1];
                return o.startsWith('http') ? t.then(() => fetch(o)
                  .then(e => e.blob())
                  .then(e => {
                    let t = new FormData;
                    return t.append('file', e, 'image.png'), fetch(`https://cdn-ms.juejin.im/v1/upload?bucket=gold-user-assets`, {
                      method: 'POST',
                      body: t,
                    })
                      .then(e => e.json())
                      .then(e => {
                        1 === e.s && (s.content = s.content.split(o)
                          .join(e.d.url.https));
                      });
                  })
                  .catch(() => e.error(`发布失败，图片不支持跨域 ${o}`))) : t.then(() => Promise.resolve());
              }, Promise.resolve()) : Promise.resolve())
              .then(() => {
                fetch(`https://post-storage-api-ms.juejin.im/v1/draftStorage`, {
                  method: 'POST',
                  headers: X_FORM_HEADER,
                  body: `uid=${t.userId}&device_id=${t.clientId}&token=${encodeURIComponent(t.token)}&src=web&category=${n.category}&content=&html=&markdown=&screenshot=&isTitleImageFullscreen=0&tags=&title=&type=markdown`,
                })
                  .then(e => e.json())
                  .then(o => {
                    1 === o.s ? fetch(`https://post-storage-api-ms.juejin.im/v1/updateDraft`, {
                      method: 'POST',
                      headers: X_FORM_HEADER,
                      body: `uid=${t.userId}&device_id=${t.clientId}&token=${encodeURIComponent(t.token)}&src=web&postId=${o.d[0]}&category=${n.category}&content=&html=${encodeURIComponent(marked(s.content))}&markdown=${encodeURIComponent(s.content)}&screenshot=&isTitleImageFullscreen=0&tags=${n.tags}&title=${encodeURIComponent(s.title)}&type=markdown`,
                    })
                      .then(e => e.json())
                      .then(s => {
                        1 === s.s ? fetch(`https://post-storage-api-ms.juejin.im/v1/postPublish`, {
                          method: 'POST',
                          headers: X_FORM_HEADER,
                          body: `uid=${t.userId}&device_id=${t.clientId}&token=${encodeURIComponent(t.token)}&src=web&postId=${o.d[0]}`,
                        })
                          .then(e => e.json())
                          .then(t => {
                            1 === t.s ? e.success(`https://juejin.im/post/${o.d[0]}`) : e.error(JSON.stringify(t));
                          }) : e.error(JSON.stringify(o));
                      }) : e.error(JSON.stringify(o));
                  });
              });
          });
      },
      articleDelete: (e, t) => {
        MAIN.ChannelService.juejin.auth()
          .then(s => {
            fetch(t.url)
              .then(e => {
                if (200 === e.status) {
                  let e = t.url.split('/'),
                    n = e[e.length - 1];
                  fetch(`https://post-storage-api-ms.juejin.im/v1/getDetailData?uid=${s.userId}&device_id=${s.clientId}&token=${encodeURIComponent(s.token)}&src=web&type=entry&postId=${n}`)
                    .then(e => e.json())
                    .then(e => {
                      fetch(`https://entry-storage-ms.juejin.im/v1/entryDel?uid=${s.userId}&device_id=${s.clientId}&token=${encodeURIComponent(s.token)}&src=web&entryId=${e.d.objectId}`)
                        .then(() => {
                        });
                    });
                }
              })
              .catch(e => console.log(e))
              .finally(() => e.success(!0));
          });
      },
      articleData: (e, t) => {
        fetch(`https://juejin.im/auth`)
          .then(s => 200 === s.status ? s.json() : (fetch(t.url)
            .then(t => {
              if (200 === t.status) return t.text();
              e.success({
                read: 0,
                like: 0,
                comment: 0,
              });
            })
            .then(t => {
              let s = (new DOMParser).parseFromString(t, 'text/html'),
                n = s.querySelector('span.views-count')
                  .textContent
                  .replace('阅读', '')
                  .trim(),
                o = s.querySelector('div.like-btn')
                  .getAttribute('badge'),
                a = s.querySelector('div.comment-btn')
                  .getAttribute('badge');
              e.success({
                read: n,
                like: o || 0,
                comment: a || 0,
              });
            }), Promise.reject('')))
          .then(s => {
            s ? fetch(t.url)
              .then(n => {
                if (200 === n.status) {
                  let n = t.url.split('/'),
                    o = n[n.length - 1];
                  fetch(`https://post-storage-api-ms.juejin.im/v1/getDetailData?uid=${s.userId}&device_id=${s.clientId}&token=${encodeURIComponent(s.token)}&src=web&type=entry&postId=${o}`)
                    .then(e => e.json())
                    .then(t => {
                      let s = t.d.viewsCount,
                        n = t.d.collectionCount,
                        o = t.d.commentsCount;
                      e.success({
                        read: s,
                        like: n,
                        comment: o,
                      });
                    });
                } else {
                  e.success({
                    read: 0,
                    like: 0,
                    comment: 0,
                  });
                }
              }) : e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          });
      },
      getConfig: e => {
        MAIN.ChannelService.juejin.auth()
          .then(t => {
            fetch(`https://gold-tag-ms.juejin.im/v1/categories`, {
              headers: {
                'X-Juejin-Client': t.clientId,
                'X-Juejin-Src': 'web',
                'X-Juejin-Token': t.token,
                'X-Juejin-Uid': t.userId,
              },
            })
              .then(e => e.json())
              .then(t => {
                let s = t.d.categoryList,
                  n = [];
                n.push({
                  key: 'Java',
                  value: '559a7207e4b08a686d25703e',
                }), n.push({
                  key: 'Go',
                  value: '555e9a80e4b00c57d9955de2',
                }), n.push({
                  key: 'Spring Boot',
                  value: '58c8ac9244d90400682037f1',
                }), n.push({
                  key: 'Spring',
                  value: '5847c9a5ac502e006ce63fa1',
                }), n.push({
                  key: 'Python',
                  value: '559a7227e4b08a686d25744f',
                }), n.push({
                  key: 'Mysql',
                  value: '555e9a8de4b00c57d9955eb9',
                }), n.push({
                  key: 'Redis',
                  value: '555e9ab1e4b00c57d99560b5',
                }), n.push({
                  key: 'Spring Cloud',
                  value: '5c0494eae51d456d19c7c7c5',
                }), n.push({
                  key: 'JVM',
                  value: '584628c88e450a006c145de0',
                }), n.push({
                  key: '分布式',
                  value: '5bf95decf265da3ff4cc84cd',
                }), n.push({
                  key: 'Linux',
                  value: '555e9af0e4b00c57d99563be',
                }), n.push({
                  key: '架构',
                  value: '55cdb52740ac79db3570607f',
                }), n.push({
                  key: 'Kubernetes',
                  value: '583bd28aac502e006c277c8c',
                }), n.push({
                  key: 'Docker',
                  value: '55644032e4b03286789d7528',
                }), n.push({
                  key: '数据库',
                  value: '563b142860b20bd506b3af5c',
                }), n.push({
                  key: 'JavaScript',
                  value: '55964d83e4b08a686cc6b353',
                }), n.push({
                  key: 'Vue.js',
                  value: '555e9a98e4b00c57d9955f68',
                }), n.push({
                  key: 'React.js',
                  value: '555e99ffe4b00c57d99556aa',
                }), n.push({
                  key: 'CSS',
                  value: '555eadc1e4b00c57d9962402',
                }), n.push({
                  key: 'Node.js',
                  value: '555e9a77e4b00c57d9955d64',
                }), n.push({
                  key: 'Flutter',
                  value: '5a96291f6fb9a0535b535438',
                }), n.push({
                  key: 'TypeScript',
                  value: '55e7d5a360b2d687f60ae13a',
                }), n.push({
                  key: '机器学习',
                  value: '55e2a9f600b04a63ffb7b443',
                }), n.push({
                  key: 'NLP',
                  value: '58c66466a22b9d0058b39b06',
                }), n.push({
                  key: '深度学习',
                  value: '583bdb0e61ff4b007ed261a7',
                }), n.push({
                  key: '算法',
                  value: '55cd843d60b203b0519307a9',
                }), n.push({
                  key: '计算机视觉',
                  value: '584a64e461ff4b0058d25808',
                }), n.push({
                  key: '大数据',
                  value: '5b891f26f265da3fdb154a85',
                }), n.push({
                  key: '物联网',
                  value: '561b4affddb23dadcf8125e2',
                }), e.success({
                  category: s,
                  tags: n,
                });
              });
          });
      },
      auth: () => fetch(`https://juejin.im/auth`)
        .then(e => e.json()),
    },
    juejin: {
      auth: () => fetch(`https://apinew.juejin.im/user_api/v1/user/get`)
        .then(e => e.json()),
      verifyCookie: e => {
        MAIN.ChannelService.juejin.auth()
          .then(t => {
            e.success('success' === t.err_msg);
          });
      },
      getCookie: e => {
        chrome.cookies.getAll({ url: 'https://juejin.im' }, function (t) {
          let s = t.map(e => e.name + '=' + e.value)
            .join(';') + ';';
          e(s);
        });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.category) && e.success('请先配置「分类」'), isEmpty(t.tags) && e.success('请先配置「标签」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        const { article: s = {}, config: n = {} } = t || {},
          o = {
            brief_content: '',
            cover_image: '',
            edit_type: 10,
            html_content: 'deprecated',
            link_url: '',
            content: '',
            category: '',
            tags: [],
            title: '', ...n, ...s,
          };
        fetch('https://apinew.juejin.im/content_api/v1/article_draft/create', {
          method: 'POST',
          headers: JSON_HEADER,
          body: JSON.stringify({
            ...o,
            category_id: o.category,
            mark_content: o.content,
            tag_ids: o.tags,
          }),
        })
          .then(e => e.json())
          .then(t => {
            console.log('创建草稿结果：', t), t.data && t.data.id && fetch('https://apinew.juejin.im/content_api/v1/article/publish', {
              method: 'POST',
              headers: JSON_HEADER,
              body: JSON.stringify({ draft_id: t.data.id }),
            })
              .then(e => e.json())
              .then(t => {
                console.log('文章发布结果：', t), t.data && t.data.article_id ? e.success(`https://juejin.im/post/${t.data.article_id}`) : e.error(JSON.stringify(t));
              })
              .catch(t => {
                console.warn('发文失败：', t), e.error(!1);
              });
          })
          .catch(t => {
            console.warn('创建草稿失败：', t), e.error(!1);
          });
      },
      articleDelete: (e, t) => {
        let s = (t.url || '').split('/'),
          n = s[s.length - 1];
        fetch('http://openapi.openwrite.cn/api/chrome/juejin/delete', {
          method: 'POST',
          headers: JSON_HEADER,
          body: JSON.stringify({
            id: n,
            cookie: arg.cookie || '',
          }),
        })
          .then(e => e.json())
          .then(t => {
            'success' === t.err_msg && e.success(!0);
          })
          .catch(t => {
            console.warn('文章删除失败：', t), e.error(!1);
          });
      },
      articleData: (e, t) => {
        const s = (t.url || '').split('post/'),
          n = s[s.length - 1].split('/')[0];
        n ? fetch(`https://juejin.im/post/${n}`)
          .then(t => {
            let s = n;
            t.redirected && (s = t.url.slice(23)), fetch('https://apinew.juejin.im/content_api/v1/article/detail', {
              method: 'POST',
              headers: JSON_HEADER,
              body: JSON.stringify({ article_id: s }),
            })
              .then(t => {
                if (200 === t.status) return t.json();
                e.success({
                  read: 0,
                  like: 0,
                  comment: 0,
                });
              })
              .then(t => {
                const { data: s = {} } = t, { view_count: n = 0, comment_count: o = 0, collect_count: a = 0 } = s.article_info || {};
                e.success({
                  read: n,
                  like: a,
                  comment: o,
                });
              })
              .catch(() => {
                e.success({
                  read: 0,
                  like: 0,
                  comment: 0,
                });
              });
          })
          .catch(e => {
            console.warn('掘金老文章重定向失败!');
          }) : e.success({
          read: 0,
          like: 0,
          comment: 0,
        });
      },
      getConfig: e => {
        MAIN.ChannelService.juejin.auth()
          .then(() => {
            fetch('https://apinew.juejin.im/tag_api/v1/query_category_list', {
              method: 'POST',
              headers: X_FORM_HEADER,
            })
              .then(e => e.json())
              .then(t => {
                let s = t.data.map(e => ({
                    id: e.category_id,
                    name: e.category.category_name,
                  })),
                  n = [];
                n.push({
                  key: 'Go',
                  value: '6809640364677267469',
                }), n.push({
                  key: 'Java',
                  value: '6809640445233070094',
                }), n.push({
                  key: 'Spring',
                  value: '6809640703325372423',
                }), n.push({
                  key: 'Spring Boot',
                  value: '6809641037787561992',
                }), n.push({
                  key: 'Spring Cloud',
                  value: '6809641146378092552',
                }), n.push({
                  key: 'Python',
                  value: '6809640448827588622',
                }), n.push({
                  key: 'JVM',
                  value: '6809640696455102472',
                }), n.push({
                  key: 'Linux',
                  value: '6809640385980137480',
                }), n.push({
                  key: '架构',
                  value: '6809640501776482317',
                }), n.push({
                  key: 'Kubernetes',
                  value: '6809640675944955918',
                }), n.push({
                  key: 'Docker',
                  value: '6809640396788858887',
                }), n.push({
                  key: '数据库',
                  value: '6809640600502009863',
                }), n.push({
                  key: 'MongoDB',
                  value: '6809640372352843789',
                }), n.push({
                  key: 'Mysql',
                  value: '6809640366896054286',
                }), n.push({
                  key: 'Redis',
                  value: '6809640371019055111',
                }), n.push({
                  key: '分布式',
                  value: '6809641135154135054',
                }), n.push({
                  key: 'JavaScript',
                  value: '6809640398105870343',
                }), n.push({
                  key: 'Node.js',
                  value: '6809640361531539470',
                }), n.push({
                  key: 'Flutter',
                  value: '6809641090145058824',
                }), n.push({
                  key: 'TypeScript',
                  value: '6809640543006490638',
                }), n.push({
                  key: 'Vue.js',
                  value: '6809640369764958215',
                }), n.push({
                  key: 'React.js',
                  value: '6809640357354012685',
                }), n.push({
                  key: 'CSS',
                  value: '6809640394175971342',
                }), n.push({
                  key: '机器学习',
                  value: '6809640525595934734',
                }), n.push({
                  key: 'NLP',
                  value: '6809640930740535303',
                }), n.push({
                  key: '深度学习',
                  value: '6809640679082295303',
                }), n.push({
                  key: '算法',
                  value: '6809640499062767624',
                }), n.push({
                  key: '计算机视觉',
                  value: '6809640711177109517',
                }), n.push({
                  key: '大数据',
                  value: '6809641131131797511',
                }), n.push({
                  key: '物联网',
                  value: '6809640581501812743',
                }), e.success({
                  category: s,
                  tags: n,
                });
              })
              .catch(e => {
                console.warn(e);
              });
          });
      },
    },
    oschina: {
      verifyCookie: e => {
        fetch('https://my.oschina.net/')
          .then(t => {
            e.success('https://www.oschina.net/' !== t.url);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.groups) && e.error('请先配置「发布专区」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = t.config;
        MAIN.ChannelService.oschina.home()
          .then(t => {
            MAIN.ChannelService.oschina.userCode(t)
              .then(o => {
                let a = s.content.match(/!\[.*?]\((.*?)\)/g);
                Promise.resolve()
                  .then(() => a ? a.reduce((n, o) => {
                    let a = /!\[.*?]\((.*?)\)/.exec(o)[1];
                    return a.startsWith('http') ? n.then(() => fetch(a)
                      .then(e => e.blob())
                      .then(e => {
                        let n = new FormData;
                        return n.append('editormd-image-file', e, 'image.png'), fetch(`${t}/space/markdown_img_upload`, {
                          method: 'POST',
                          body: n,
                        })
                          .then(e => e.json())
                          .then(e => {
                            1 === e.success && (s.content = s.content.split(a)
                              .join(e.url));
                          });
                      })
                      .catch(() => e.error(`发布失败，图片不支持跨域 ${a}`))) : n.then(() => Promise.resolve());
                  }, Promise.resolve()) : Promise.resolve())
                  .then(() => {
                    fetch(`${t}/blog/save`, {
                      method: 'POST',
                      headers: X_FORM_HEADER,
                      body: `draft=0&id=&user_code=${o}&title=${encodeURIComponent(s.title)}&content=${encodeURIComponent(s.content)}&content_type=3&catalog=${n.catalog}&groups=${(n.groups || []).join(',')}&type=1&origin_url=&privacy=0&deny_comment=0&as_top=0&downloadImg=0&isRecommend=1`,
                    })
                      .then(e => e.json())
                      .then(s => {
                        1 === s.code ? e.success(`${t}/blog/${s.result.id}`) : e.error(JSON.stringify(s));
                      });
                  });
              });
          });
      },
      articleDelete: (e, t) => {
        MAIN.ChannelService.oschina.home()
          .then(s => {
            MAIN.ChannelService.oschina.userCode(s)
              .then(n => {
                fetch(t.url)
                  .then(e => {
                    if (200 === e.status) {
                      let e = t.url.split('/'),
                        o = e[e.length - 1];
                      fetch(`${s}/blog/delete`, {
                        method: 'POST',
                        headers: X_FORM_HEADER,
                        body: `id=${o}&user_code=${n}`,
                      })
                        .then(() => {
                        });
                    }
                  })
                  .catch(e => console.log(e))
                  .finally(() => e.success(!0));
              });
          });
      },
      getConfig: e => {
        MAIN.ChannelService.oschina.home()
          .then(t => {
            fetch(`${t}/blog/write`)
              .then(e => e.text())
              .then(t => {
                let s = (new DOMParser).parseFromString(t, 'text/html'),
                  n = s.querySelectorAll('select[name=classification] option'),
                  o = [];
                n.forEach(e => {
                  o.push({
                    key: e.textContent,
                    value: e.getAttribute('value'),
                  });
                }), o.shift();
                let a = [];
                (n = s.querySelectorAll('select#catalogDropdown option')).forEach(e => {
                  a.push({
                    key: e.textContent,
                    value: e.getAttribute('value'),
                  });
                }), e.success({
                  systemCategory: o,
                  myCategory: a,
                });
              });
          });
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html')
              .querySelectorAll('div.article-detail div.list div.item'),
              n = 0,
              o = s[2].textContent.replace('阅读', '')
                .trim();
            n = -1 != o.indexOf('.') ? o.replace('.', '')
              .replace('K', '00')
              .replace('W', '000') : o.replace('K', '000')
              .replace('W', '0000');
            let a = s[4].textContent.replace('点赞', '')
              .trim(),
              r = s[5].textContent.replace('评论', '')
                .trim();
            e.success({
              read: n,
              like: a,
              comment: r,
            });
          });
      },
      home: () => fetch('https://my.oschina.net/')
        .then(e => e.url),
      userCode: e => fetch(e)
        .then(e => e.text())
        .then(e => {
          let t = (new DOMParser).parseFromString(e, 'text/html')
            .querySelector('val[data-name=g_user_code]')
            .getAttribute('data-value');
          return isEmpty(t) ? Promise.reject('Failed fetch user code') : t;
        }),
    },
    spring4all: {
      verifyCookie: e => {
        fetch(`http://www.spring4all.com/user/api/data`)
          .then(t => {
            e.success(!t.redirected);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.category) && e.success('请先配置「分类」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = new FormData;
        s.append('title', t.article.title), s.append('contentMd', t.article.content), s.append('contentHtml', marked(t.article.content)), s.append('categoryId', t.config.category), s.append('description', ''), fetch(`http://www.spring4all.com/user/api/article/publish`, {
          method: 'POST',
          body: s,
        })
          .then(e => e.json())
          .then(t => {
            e.success(`http://www.spring4all.com/article/${t.data}`);
          });
      },
      articleDelete: (e, t) => {
        fetch(t.url)
          .then(e => {
            if (200 === e.status) {
              let e = t.url.split('/'),
                s = e[e.length - 1];
              fetch(`http://www.spring4all.com/user/api/article/${s}/delete`, { method: 'POST' })
                .then(() => {
                });
            }
          })
          .finally(() => e.success(!0));
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = JSON.parse(/article: (.*),/.exec(t)[1]),
              n = s.read,
              o = s.like,
              a = s.comment;
            e.success({
              read: n,
              like: o,
              comment: a,
            });
          });
      },
      getConfig: (e, t) => {
        let s = [];
        s.push({
          key: '综合',
          value: '1',
        }), s.push({
          key: 'Spring Boot',
          value: '2',
        }), s.push({
          key: 'Spring Cloud',
          value: '3',
        }), s.push({
          key: 'Spring Framework',
          value: '4',
        }), s.push({
          key: 'Spring Security',
          value: '5',
        }), s.push({
          key: 'Spring Data',
          value: '6',
        }), s.push({
          key: 'Spring Batch',
          value: '7',
        }), s.push({
          key: 'Spring AMQP',
          value: '8',
        }), e.success({ categories: s });
      },
    },
    segmentfault: {
      verifyCookie: e => {
        fetch(`https://segmentfault.com/user/finance`)
          .then(t => {
            e.success(!t.redirected);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.type) && e.success('请先配置「类型」'), '1' !== t.type && isEmpty(t.url) && e.success('请先配置「站外链接」'), (isEmpty(t.category) || isEmpty(t.tags)) && e.success('请先配置「标签」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article;
        MAIN.ChannelService.segmentfault.token(`https://segmentfault.com/write?freshman=1`)
          .then(n => {
            let o = s.content.match(/!\[.*?]\((.*?)\)/g);
            Promise.resolve()
              .then(() => o ? o.reduce((t, o) => {
                let a = /!\[.*?]\((.*?)\)/.exec(o)[1];
                return a.startsWith('http') ? t.then(() => fetch(a)
                  .then(e => e.blob())
                  .then(e => {
                    let t = new FormData;
                    return t.append('image', e, 'image.png'), fetch(`https://segmentfault.com/img/upload/image?_=${n}`, {
                      method: 'POST',
                      body: t,
                    })
                      .then(e => e.json())
                      .then(e => {
                        0 === e[0] && (s.content = s.content.split(a)
                          .join(e[1]));
                      });
                  })
                  .catch(() => {
                    e.success(`发布失败，图片不支持跨域 ${a}`);
                  })) : t.then(() => Promise.resolve());
              }, Promise.resolve()) : Promise.resolve())
              .then(() => {
                let o = new FormData;
                o.append('title', s.title), o.append('text', s.content), o.append('type', t.config.type), o.append('url', t.config.url), o.append('tags', String(t.config.tags)), o.append('blogId', '0'), o.append('isTiming', '0'), o.append('created', ''), o.append('weibo', '0'), o.append('license', '0'), o.append('articleId', ''), o.append('draftId', ''), fetch(`https://segmentfault.com/api/articles/add?_=${n}`, {
                  method: 'POST',
                  body: o,
                })
                  .then(e => e.json())
                  .then(t => {
                    0 === t.status ? e.success(`https://segmentfault.com${t.data.url}`) : e.error(JSON.stringify(t));
                  });
              });
          });
      },
      articleDelete: (e, t) => {
        fetch(t.url)
          .then(e => {
            if (200 === e.status) {
              let e = t.url.split('/'),
                s = e[e.length - 1];
              MAIN.ChannelService.segmentfault.token(t.url)
                .then(e => {
                  fetch(`https://segmentfault.com/api/article/${s}/delete?_=${e}`, {
                    method: 'POST',
                    headers: X_FORM_HEADER,
                    body: `reason=${encodeURIComponent('推广广告信息 - 广告、招聘、推广、测试等内容')}`,
                  })
                    .then(() => {
                    });
                });
            }
          })
          .finally(() => e.success(!0));
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html')
              .querySelector('#sf-article_metas');
            console.log(s.dataset.viewsword);
            let n = s.dataset.viewsword;
            -1 != n.indexOf('.') ? read = n.replace('.', '')
              .replace('k', '00')
              .replace('w', '000') : read = n.replace('k', '000')
              .replace('w', '0000');
            let o = /votes: ([0-9]+?),/.exec(t)[1];
            e.success({
              read: read,
              like: o,
              comment: 0,
            });
          });
      },
      getConfig: (e, t) => {
        fetch(`https://segmentfault.com/tags`)
          .then(e => e.text())
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html'),
              n = {};
            s.querySelectorAll('div.tag-list__itemWraper')
              .forEach(e => {
                let t = [];
                e.querySelectorAll('a.tag')
                  .forEach(e => {
                    t.push({
                      key: e.getAttribute('data-original-title'),
                      value: e.getAttribute('data-id'),
                    });
                  }), n[e.querySelector('h3').textContent] = t;
              }), e.success({ category: n });
          });
      },
      token: url => fetch(url)
        .then(e => e.text())
        .then(html => {
          let token = eval(/w.SF.token = ([\s\S]*?);;/.exec(html)[1]);
          return isEmpty(token) ? Promise.reject('Failed fetch SF token') : token;
        }),
    },
    toutiao: {
      verifyCookie: e => {
        fetch('https://mp.toutiao.com/account_info/?output=json')
          .then(t => {
            e.success(200 === t.status);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.article_ad_type) && e.success('请先配置「广告类型」'), e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = marked(s.content),
          o = (new DOMParser).parseFromString(n, 'text/html'),
          a = o.getElementsByTagName('img');
        Promise.resolve()
          .then(() => a.length > 0 ? Array.prototype.slice.call(a)
            .reduce((e, t, s) => {
              let n = t.getAttribute('src');
              return n.startsWith('http') ? e.then(() => {
                let e = new FormData;
                return e.append('upfile', n), e.append('version', '2'), fetch(`http://mp.toutiao.com/mp/agw/article_material/photo/catch_picture`, {
                  method: 'POST',
                  body: e,
                })
                  .then(e => e.json())
                  .then(e => {
                    if ('success' === e.message && e.images) {
                      const { images: t = [] } = e,
                        n = t[0] || {};
                      o.getElementsByTagName('img')[s].setAttribute('src', n.url), o.getElementsByTagName('img')[s].setAttribute('ic', 'false'), o.getElementsByTagName('img')[s].setAttribute('store_id', !0), o.getElementsByTagName('img')[s].setAttribute('image_ids', '[]'), o.getElementsByTagName('img')[s].setAttribute('image_type', n.image_type), o.getElementsByTagName('img')[s].setAttribute('mime_type', n.mime_type), o.getElementsByTagName('img')[s].setAttribute('web_uri', n.original_web_uri), o.getElementsByTagName('img')[s].setAttribute('img_width', n.width), o.getElementsByTagName('img')[s].setAttribute('img_height', n.height), o.getElementsByTagName('img')[s].setAttribute('alt', '文章配图');
                    }
                  })
                  .catch(e => {
                    console.warn('头条图片上传失败', e);
                  });
              }) : e.then(() => Promise.resolve());
            }, Promise.resolve()) : Promise.resolve())
          .then(() => {
            o.querySelectorAll('a')
              .forEach(e => e.setAttribute('href', '')), fetch(`http://mp.toutiao.com/mp/agw/article/publish?source=mp&type=article`, {
              method: 'POST',
              headers: X_FORM_HEADER,
              body: ['source=0', `content=${encodeURIComponent(o.body.innerHTML)}`, `title=${encodeURIComponent(s.title)}`, 'search_creation_info={"abstract":""}', 'title_id=', 'extra=', 'mp_editor_stat=', 'educluecard=', 'pgc_feed_covers=', 'claim_origin=0', 'origin_debut_check_pgc_normal=0', 'qy_self_recommendation=0', 'is_fans_article=0', 'govern_forward=0', 'praise=0', 'disable_praise=0', 'article_ad_type=3', 'writing_race_2020=0', 'tree_plan_article=0', 'activity_tag=0', 'trends_writing_tag=0', 'community_sync=0', 'save=1', 'timer_status=0', 'timer_time='].join('&'),
            })
              .then(e => e.json())
              .then(t => {
                0 === t.code ? e.success(`https://www.toutiao.com/i${t.data.pgc_id}`) : e.error(JSON.stringify(t));
              });
          });
      },
      articleData: (e, t) => {
        const [s = ''] = t.url.match(/\d+/);
        fetch(`http://mp.toutiao.com/mp/agw/statistic/v2/item/info?item_id=${s}&type=1`)
          .then(t => {
            if (200 === t.status) return t.json();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            if (console.log(t), 'success' === t.message) {
              const { item_data: s = {} } = t || {}, { item_stat: n = {} } = s, { consume_data: o = {}, interaction_data: a = {} } = n, { go_detail_count: r = 0 } = o, { comment_count: i = 0, digg_count: c = 0 } = a;
              e.success({
                read: r,
                like: c,
                comment: i,
              });
            } else {
              e.success({
                read: 0,
                like: 0,
                comment: 0,
              });
            }
          })
          .catch(e => {
            console.warn(e);
          });
      },
      articleDelete: (e, t) => {
        e.success(!0);
      },
      getConfig: e => {
        e.success(!0);
      },
    },
    zhihu: {
      verifyCookie: e => {
        fetch(`https://www.zhihu.com/api/v4/me?include=visits_count`)
          .then(t => {
            e.success(200 === t.status);
          });
      },
      verifyChannelConfig: (e, t) => {
        isEmpty(t.topic) ? e.success('请先配置「话题」') : fetch(`https://zhuanlan.zhihu.com/api/autocomplete/topics?token=${encodeURIComponent(t.topic)}&max_matches=5&use_similar=0&topic_filter=1`)
          .then(e => e.json())
          .then(t => {
            t.length > 0 ? e.success(!0) : e.error('「话题」不存在');
          });
      },
      articlePublish: (e, t) => {
        let s = t.article,
          n = t.config,
          o = marked(s.content),
          a = (new DOMParser).parseFromString(o, 'text/html'),
          r = a.getElementsByTagName('img');
        MAIN.ChannelService.zhihu.token(t => {
          fetch(`https://zhuanlan.zhihu.com/api/autocomplete/topics?token=${encodeURIComponent(n.topic)}&max_matches=5&use_similar=0&topic_filter=1`)
            .then(e => e.json())
            .then(n => {
              Promise.resolve()
                .then(() => r.length > 0 ? Array.prototype.slice.call(r)
                  .reduce((s, n, o) => {
                    let r = n.getAttribute('src');
                    return r.startsWith('http') ? s.then(() => s.then(() => fetch(r)
                      .then(e => e.blob())
                      .then(e => {
                        let s = new FormData;
                        return s.append('picture', e, 'image.png'), s.append('source', 'article'), fetch(`https://zhuanlan.zhihu.com/api/uploaded_images`, {
                          method: 'POST',
                          headers: {
                            'x-xsrftoken': t,
                            'x-requested-with': 'fetch',
                          },
                          body: s,
                        })
                          .then(e => e.json())
                          .then(e => {
                            a.getElementsByTagName('img')[o].setAttribute('src', e.src), a.getElementsByTagName('img')[o].setAttribute('data-size', 'normal'), a.getElementsByTagName('img')[o].setAttribute('data-rawwidth', e['data-rawwidth']), a.getElementsByTagName('img')[o].setAttribute('data-rawheight', e['data-rawheight']), a.getElementsByTagName('img')[o].setAttribute('data-watermark', 'original'), a.getElementsByTagName('img')[o].setAttribute('data-original-src', e.original_src), a.getElementsByTagName('img')[o].setAttribute('data-watermark-src', e.watermark_src), a.getElementsByTagName('img')[o].setAttribute('alt', '');
                          });
                      })
                      .catch(() => e.error(`发布失败，图片不支持跨域 ${r}`)))) : s.then(() => Promise.resolve());
                  }, Promise.resolve()) : Promise.resolve())
                .then(() => {
                  let t = {
                    content: a.body.innerHTML,
                    title: s.title,
                    delta_time: 0,
                  };
                  fetch(`https://zhuanlan.zhihu.com/api/articles/drafts`, {
                    method: 'POST',
                    headers: JSON_HEADER,
                    body: JSON.stringify(t),
                  })
                    .then(e => e.json())
                    .then(t => {
                      fetch(`https://zhuanlan.zhihu.com/api/articles/${t.id}/topics`, {
                        method: 'POST',
                        headers: JSON_HEADER,
                        body: JSON.stringify(n[0]),
                      })
                        .then(e => e.json())
                        .then(s => {
                          fetch(`https://zhuanlan.zhihu.com/api/articles/${t.id}/publish`, {
                            method: 'PUT',
                            headers: JSON_HEADER,
                            body: JSON.stringify({
                              column: null,
                              commentPermission: 'anyone',
                              disclaimer_status: 'close',
                              disclaimer_type: 'none',
                            }),
                          })
                            .then(s => {
                              e.success(`https://zhuanlan.zhihu.com/p/${t.id}`);
                            });
                        });
                    });
                });
            });
        });
      },
      articleDelete: (e, t) => {
        fetch(t.url)
          .then(e => {
            if (200 === e.status) {
              let e = t.url.split('/'),
                s = e[e.length - 1];
              fetch(`https://www.zhihu.com/api/v4/articles/${s}`, { method: 'DELETE' })
                .then(() => {
                });
            }
          })
          .finally(() => e.success(!0));
      },
      articleData: (e, t) => {
        const { title: s = '', date: n = '' } = t;
        fetch(`${'https://www.zhihu.com/api/v4/creator/content_statistics/articles?order_field=object_created&order_sort=descend'}&begin_date=${n}&end_date=${n}&page_no=1`)
          .then(e => e.json())
          .then(t => {
            const n = (t.data || []).filter(e => e.title === s)[0] || {};
            e.success({
              read: n.read_count || 0,
              like: n.upvoted_count || 0,
              comment: n.commented_count || 0,
            });
          })
          .catch(t => {
            console.warn('知乎数据获取失败：', t), e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          });
      },
      getConfig: e => {
        e.success({ topics: {} });
      },
      token: e => {
        chrome.cookies.get({
          url: `https://www.zhihu.com`,
          name: `_xsrf`,
        }, t => e(t.value));
      },
    },
    weibo: {
      verifyCookie: e => {
        fetch('https://weibo.com/aj/account/watermark')
          .then(e => e.json())
          .then(t => {
            e.success('100000' === t.code);
          })
          .catch(t => {
            console.warn('微博认证失败：', t), e.success(!1);
          });
      },
      verifyChannelConfig: (e, t) => {
        e.success(!0);
      },
      articlePublish: (e, t) => {
        let s = t.article, { isreward: n = 0, follow_to_read: o = 0 } = t.config || {},
          a = marked(s.content),
          r = (new DOMParser).parseFromString(a, 'text/html')
            .getElementsByTagName('img');
        fetch('https://weibo.com/')
          .then(t => {
            if (t.redirected) {
              const { url: i = '' } = t,
                c = i.split('?')[0].match(/\d+/g)[0];
              fetch(`https://card.weibo.com/article/v3/aj/editor/draft/create?uid=${c}`, { method: 'POST' })
                .then(e => e.json())
                .then(t => {
                  if (1e5 === t.code) {
                    const i = t.data || {};
                    fetch(`https://card.weibo.com/article/v3/aj/editor/draft/save?uid=${c}&id=${i.id}`, {
                      method: 'POST',
                      headers: X_FORM_HEADER,
                      body: [`id=${i.id}`, `title=${s.title}`, `updated=${i.updated}`, `subtitle=`, `type=`, `status=0`, `publish_at=`, `error_msg=`, `error_code=0`, `collection=[]`, `free_content=`, `content=${encodeURIComponent(a)}`, `cover=${encodeURIComponent(r.length && r[0].src ? r[0].src : 'https://wx4.sinaimg.cn/large/abd13f1bly1fjb28knztnj20ku0bqwh5.jpg')}`, `writer=`, `extra=[]`, `is_word=0`, `article_recommend=[]`, `follow_to_read=${o}`, `follow_to_read_detail[result]=1`, `follow_to_read_detail[x]=0`, `follow_to_read_detail[y]=0`, `follow_to_read_detail[readme_link]=${encodeURIComponent(`http://t.cn/A6UnJsqW`)}`, `follow_to_read_detail[level]=`, `isreward=${n}`, `pay_setting={"ispay":0,"isvclub":0}`, `source=0`, `action=0`, `content_type=0`, `save=1`].join('&'),
                    })
                      .then(e => e.json())
                      .then(t => {
                        console.log('文章保存成功！', t), fetch(`https://card.weibo.com/article/v3/aj/editor/draft/publish?uid=${c}&id=${i.id}`, {
                          method: 'POST',
                          headers: X_FORM_HEADER,
                          body: [`id=${i.id}`, `rank=0`, `text=${s.title}`, `follow_official=1`, `sync_wb=0`, `is_original=0`, `time=`].join('&'),
                        })
                          .then(e => e.json())
                          .then(t => {
                            1e5 === t.code && e.success(t.data.url);
                          })
                          .catch(t => {
                            console.warn('文章发布失败', t), e.error('文章发布失败');
                          });
                      })
                      .catch(t => {
                        console.warn('文章保存失败！', t), e.error('文章保存失败');
                      });
                  } else {
                    e.error(t.msg);
                  }
                })
                .catch(t => {
                  console.warn('微博创建草稿失败！', t), e.error('微博创建草稿失败');
                });
            } else {
              console.warn('获取微博uid失败！');
            }
          });
      },
      articleDelete: (e, t) => {
        fetch(t.url)
          .then(e => {
            if (200 === e.status) {
              let e = t.url.split('/'),
                s = e[e.length - 1];
              fetch(`https://www.zhihu.com/api/v4/articles/${s}`, { method: 'DELETE' })
                .then(() => {
                });
            }
          })
          .finally(() => e.success(!0));
      },
      articleData: (e, t) => {
        fetch(t.url)
          .then(t => {
            if (200 === t.status) return t.text();
            e.success({
              read: 0,
              like: 0,
              comment: 0,
            });
          })
          .then(t => {
            let s = (new DOMParser).parseFromString(t, 'text/html')
              .querySelector('span.num')
              .innerHTML
              .trim()
              .match(/\d+/g)[0] || 0;
            e.success({
              read: s,
              like: 0,
              comment: 0
            })
          })
      },
      getConfig: e => {
        e.success({})
      }
    },
    bilibili: {}
  }
};
