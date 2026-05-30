export const culturePoints = {
  chenxiang: [
    {
      id: 'cx1',
      title: '沉香的历史渊源',
      content: '沉香文化源远流长，早在汉代就已传入中国。汉武帝时期，沉香作为贡品进入宫廷，成为皇室贵族的珍贵香料。',
      icon: '📜'
    },
    {
      id: 'cx2',
      title: '奇楠香的珍贵',
      content: '奇楠是沉香中的极品，被誉为"香中之王"。一块好的奇楠香，需要几十年甚至上百年才能形成，产量极为稀少。',
      icon: '👑'
    },
    {
      id: 'cx3',
      title: '沉香的药用价值',
      content: '沉香不仅是名贵香料，也是珍贵的中药材。在中医中，沉香具有行气止痛、温中止呕、纳气平喘的功效。',
      icon: '💊'
    },
    {
      id: 'cx4',
      title: '海南沉香',
      content: '海南沉香被誉为"琼脂天香"，是中国沉香中的上品。宋代大文豪苏东坡曾说："海南沉香，一片万钱"。',
      icon: '🏝️'
    }
  ],
  tanxiang: [
    {
      id: 'tx1',
      title: '檀香的分类',
      content: '檀香主要分为老山檀和新山檀。老山檀产自印度迈索尔，香气醇厚温润；新山檀多产自澳大利亚，香气清新淡雅。',
      icon: '🌳'
    },
    {
      id: 'tx2',
      title: '檀香与佛教',
      content: '檀香在佛教中占有重要地位，被列为"五香"之首。佛家认为檀香能够通佛、去邪气，是供佛的重要贡品。',
      icon: '🕉️'
    },
    {
      id: 'tx3',
      title: '檀香的功效',
      content: '檀香具有安抚神经、辅助冥想的作用，能够缓解焦虑和压力，帮助人们进入平静的状态。',
      icon: '🧘'
    }
  ],
  hexing: [
    {
      id: 'hx1',
      title: '合香的历史',
      content: '中国的合香文化始于春秋时期，盛行于唐宋。宋代《陈氏香谱》记载了上百种合香配方，是中国香道文化的瑰宝。',
      icon: '📚'
    },
    {
      id: 'hx2',
      title: '合香的原则',
      content: '合香讲究"君、臣、佐、使"的配伍原则，如同中医配药一般，讲究各香料之间的平衡与协调。',
      icon: '⚖️'
    },
    {
      id: 'hx3',
      title: '和香与和心',
      content: '古人云："和香先和心"。制香人在合香时需要保持内心的平静与专注，这样才能制作出好的香品。',
      icon: '💝'
    }
  ],
  longxian: [
    {
      id: 'lx1',
      title: '龙涎香的来源',
      content: '龙涎香是抹香鲸的分泌物，需要在海水中漂浮数十年甚至上百年才能形成，是世界上最珍贵的香料之一。',
      icon: '🐋'
    },
    {
      id: 'lx2',
      title: '龙涎香的传说',
      content: '古人认为龙涎香是"龙"在海中睡觉时流下的唾液凝结而成，因此得名。实际上它是抹香鲸消化系统的产物。',
      icon: '🐉'
    }
  ],
  common: [
    {
      id: 'cm1',
      title: '香道与茶道',
      content: '香道与茶道密不可分。古人品茶时必焚香，茶香与香韵相得益彰，共同营造出雅致的品茗氛围。',
      icon: '🍵'
    },
    {
      id: 'cm2',
      title: '品香的礼仪',
      content: '品香时有诸多讲究：不能用鼻子直接凑上去闻，应该用手轻轻将香气扇向鼻尖；传递香炉时要双手奉送等。',
      icon: '🙏'
    },
    {
      id: 'cm3',
      title: '香器之美',
      content: '香道器具包括香炉、香盒、香匙、香铲等，材质涵盖铜、瓷、玉、木等，制作工艺精湛，本身就是艺术品。',
      icon: '🏺'
    },
    {
      id: 'cm4',
      title: '四季用香',
      content: '古人讲究四季用香不同：春季宜用花香以助生发，夏季宜用清香以解暑热，秋季宜用果香以迎丰收，冬季宜用木香以暖身心。',
      icon: '🌸'
    },
    {
      id: 'cm5',
      title: '隔火熏香',
      content: '隔火熏香是宋代流行的品香方式，不用明火直接点燃香品，而是用炭火烧热银叶来加温，香气更加优雅纯净。',
      icon: '🔥'
    }
  ]
}

export const getCulturePointsByCategory = (category) => {
  const points = []
  if (culturePoints[category]) {
    points.push(...culturePoints[category])
  }
  points.push(...culturePoints.common)
  return points
}
