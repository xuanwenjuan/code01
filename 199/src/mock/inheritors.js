export const mockInheritors = [
  {
    id: 1,
    name: '陈香远',
    title: '国家级非物质文化遗产传承人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inheritor1',
    experience: '40年制香经验',
    origin: '广东东莞',
    description: '陈氏香道第十三代传人，深耕香道四十年，精通古法和香技艺，曾多次赴日本、韩国进行香道文化交流。',
    achievements: [
      '2018年荣获"中国制香大师"称号',
      '2020年恢复宋代"隔火熏香"古法技艺',
      '2022年出版《陈氏香谱今释》专著',
      '2023年受邀担任故宫香道文化顾问'
    ],
    philosophy: '香者，天地之精华，人心之映照。制香如做人，贵在真诚与坚持。',
    resume: [
      { year: '1970年', event: '出生于广东东莞陈氏香道世家' },
      { year: '1978年', event: '8岁开始跟随祖父学习香道基础知识' },
      { year: '1985年', event: '15岁开始独立制作线香，技艺日渐精湛' },
      { year: '1990年', event: '正式继承家业，成为陈氏香道第十三代传人' },
      { year: '1995年', event: '赴日本进行香道文化交流，学习日本香道技法' },
      { year: '2003年', event: '创办"香远堂"香道工作室' },
      { year: '2010年', event: '开始系统研究宋代香谱，致力于古法恢复' },
      { year: '2018年', event: '荣获"中国制香大师"称号' },
      { year: '2020年', event: '成功恢复宋代"隔火熏香"古法技艺' },
      { year: '2022年', event: '出版《陈氏香谱今释》专著，影响深远' }
    ]
  },
  {
    id: 2,
    name: '李檀香',
    title: '省级非物质文化遗产传承人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inheritor2',
    experience: '35年制香经验',
    origin: '福建厦门',
    description: '李氏檀香制香技艺第七代传人，专注檀香研究三十余年，对檀香的品鉴与炮制有独到见解。',
    achievements: [
      '2015年创立"檀香堂"个人品牌',
      '2019年完成《檀香品鉴大全》编著',
      '2021年获得福建省"工艺美术大师"称号',
      '2023年举办个人香道作品展'
    ],
    philosophy: '檀香是有灵性的，你对它付出多少，它就会回报你多少。',
    resume: [
      { year: '1975年', event: '出生于福建厦门制香世家' },
      { year: '1983年', event: '开始接触檀香制香技艺，展现出过人天赋' },
      { year: '1990年', event: '远赴印度迈索尔，学习檀香鉴别技艺' },
      { year: '1998年', event: '回到厦门，开设第一家檀香专卖店' },
      { year: '2005年', event: '独创"低温慢磨"檀香粉制作工艺' },
      { year: '2012年', event: '被评为厦门市非物质文化遗产传承人' },
      { year: '2015年', event: '创立"檀香堂"个人品牌，享誉业界' },
      { year: '2019年', event: '编著《檀香品鉴大全》，成为行业标准' },
      { year: '2021年', event: '荣获福建省"工艺美术大师"称号' }
    ]
  },
  {
    id: 3,
    name: '王清韵',
    title: '青年制香师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inheritor3',
    experience: '15年制香经验',
    origin: '浙江杭州',
    description: '毕业于中国美术学院，将传统香道与现代设计理念结合，创作出多款深受年轻人喜爱的新中式香品。',
    achievements: [
      '2018年获得"全国香道创新大赛"金奖',
      '2020年创立"清韵香事"工作室',
      '2022年受邀参加巴黎香氛展',
      '2023年与故宫联名推出"御香"系列'
    ],
    philosophy: '传统不是包袱，而是创新的根基。让古老的香道在当代焕发新的生命力。',
    resume: [
      { year: '1992年', event: '出生于浙江杭州书香门第' },
      { year: '2010年', event: '考入中国美术学院，学习视觉传达设计' },
      { year: '2013年', event: '偶然接触香道，产生浓厚兴趣，开始拜师学艺' },
      { year: '2014年', event: '大学毕业，决定投身香道事业' },
      { year: '2016年', event: '赴日本学习香道包装设计理念' },
      { year: '2018年', event: '参加"全国香道创新大赛"，作品"花间意"荣获金奖' },
      { year: '2020年', event: '在杭州创立"清韵香事"工作室' },
      { year: '2022年', event: '受邀参加巴黎香氛展，将中国香道带向世界' },
      { year: '2023年', event: '与故宫联名推出"御香"系列，大获成功' }
    ]
  }
]

export const getInheritorById = (id) => {
  return mockInheritors.find(inheritor => inheritor.id === parseInt(id))
}
