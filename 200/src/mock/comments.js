export const comments = {
  1: [
    {
      id: 1,
      userId: 'user_001',
      userName: '李明',
      userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20craftsman%20portrait%20woodworking%20artisan&image_size=square',
      content: '燕尾榫真的是榫卯中的经典！做了十几年木工，每次做燕尾榫都能感受到古人的智慧。这个教程讲解得非常详细，特别是角度计算的部分，对新手很有帮助。',
      rating: 5,
      likes: 128,
      createdAt: '2024-05-18 14:30',
      replies: [
        {
          id: 11,
          userId: 'user_002',
          userName: '王芳',
          userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20female%20furniture%20designer%20portrait&image_size=square',
          content: '同意！燕尾榫的角度确实是关键，15度和20度做出来的手感完全不同。',
          createdAt: '2024-05-18 15:20'
        }
      ]
    },
    {
      id: 2,
      userId: 'user_002',
      userName: '王芳',
      userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20female%20furniture%20designer%20portrait&image_size=square',
      content: '作为一个家具设计师，我经常在现代设计中运用燕尾榫的原理。传统技艺真的是取之不尽的宝库！建议大家多看看明式家具，里面的燕尾榫运用堪称艺术。',
      rating: 5,
      likes: 89,
      createdAt: '2024-05-17 10:15',
      replies: []
    },
    {
      id: 3,
      userId: 'user_003',
      userName: '小张同学',
      userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20chinese%20student%20portrait&image_size=square',
      content: '刚学木工半年，终于看懂燕尾榫的结构了！请问大神们，新手练习用什么木材比较好？',
      rating: 4,
      likes: 45,
      createdAt: '2024-05-16 20:45',
      replies: [
        {
          id: 31,
          userId: 'user_001',
          userName: '李明',
          userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20craftsman%20portrait%20woodworking%20artisan&image_size=square',
          content: '新手推荐用松木或者杨木，质地较软，容易加工，价格也便宜。等熟练了再用硬木。',
          createdAt: '2024-05-16 21:30'
        }
      ]
    },
    {
      id: 4,
      userId: 'user_004',
      userName: '传统工艺爱好者',
      userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=middle%20aged%20chinese%20man%20portrait%20casual&image_size=square',
      content: '这个三维模型做得太好了！要是能有AR功能就更棒了，可以在真实空间里查看榫卯结构。',
      rating: 5,
      likes: 156,
      createdAt: '2024-05-15 09:00',
      replies: []
    }
  ],
  10: [
    {
      id: 1,
      userId: 'user_001',
      userName: '李明',
      userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20craftsman%20portrait%20woodworking%20artisan&image_size=square',
      content: '斗拱真的是中国建筑的精髓！有幸参与过一次古建筑修缮，亲眼看到斗拱的承重能力，太震撼了。',
      rating: 5,
      likes: 234,
      createdAt: '2024-05-10 11:20',
      replies: []
    }
  ],
  5: [
    {
      id: 1,
      userId: 'user_002',
      userName: '王芳',
      userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20female%20furniture%20designer%20portrait&image_size=square',
      content: '模块化榫卯是未来的方向！我们工作室最近也在做类似的研究，希望能推动传统工艺的现代化。',
      rating: 5,
      likes: 178,
      createdAt: '2024-05-12 15:30',
      replies: []
    }
  ]
}

export const knowledgePoints = {
  1: [
    {
      id: 'kp1',
      title: '燕尾榫的角度',
      content: '燕尾榫的角度通常在15°-20°之间。角度太小，榫头容易拔出；角度太大，榫头容易折断。传统经验是"一寸入三分"，即每延伸一寸（约3.3厘米），宽度增加三分（约1厘米），这个比例约为17°，被认为是最理想的角度。',
      relatedPart: '榫头'
    },
    {
      id: 'kp2',
      title: '半隐燕尾榫 vs 全隐燕尾榫',
      content: '半隐燕尾榫（Half-blind Dovetail）：榫头的一面不外露，常用于抽屉面板，美观但强度稍低。全隐燕尾榫（Full-blind Dovetail）：榫头完全隐藏，从外面看不到榫头，用于高档家具的箱体连接，工艺难度大但极其美观。',
      relatedPart: '卯眼'
    },
    {
      id: 'kp3',
      title: '硬木 vs 软木',
      content: '制作燕尾榫时，硬木（如红木、花梨木）密度高、耐磨性好，但加工难度大，需要锋利的工具。软木（如松木、杨木）易于加工，但榫头的耐用性较低。传统家具中，燕尾榫多用硬木制作，以确保百年不松。',
      relatedPart: '材料'
    },
    {
      id: 'kp4',
      title: '胶接的重要性',
      content: '虽然燕尾榫本身的机械连接已经很强，但传统工艺中仍会使用动物胶（如鱼胶、猪皮胶）进行胶接。现代工艺多用木工白乳胶。胶接不仅增加强度，还能防止潮气进入，保护木材内部。',
      relatedPart: '组装'
    }
  ],
  10: [
    {
      id: 'kp1',
      title: '斗拱的历史演变',
      content: '斗拱最早出现于西周时期的青铜器纹样中。唐代斗拱硕大，以承重为主；宋代斗拱比例适中，开始兼具装饰功能；明清斗拱逐渐变小，装饰功能增强，承重功能减弱。斗拱的演变反映了中国建筑技术和审美观念的变化。',
      relatedPart: '斗'
    },
    {
      id: 'kp2',
      title: '斗拱的抗震原理',
      content: '斗拱由多个小构件榫卯连接而成，形成一个柔性结构。地震时，斗拱各构件之间可以产生微小位移，吸收和消耗地震能量，从而保护主体结构。应县木塔历经千年多次地震而不倒，斗拱功不可没。',
      relatedPart: '拱'
    },
    {
      id: 'kp3',
      title: '斗拱的等级制度',
      content: '古代建筑中，斗拱的形制有严格的等级规定。宋代《营造法式》规定了八种斗拱形制，称为"八等"。建筑等级越高，斗拱越复杂、越华丽。故宫太和殿的斗拱是最高等级的形制。',
      relatedPart: '昂'
    }
  ]
}
