import { Request, Response, NextFunction } from 'express';
import { Artist, User, Product } from '../models';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { ArtistStatus, Role, PaginatedResult } from '../types';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../database';

export const applyArtist = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user!.userId;
    const { name, avatar, bio, specialties, style, representativeWorks } = req.body;

    const existingArtist = await Artist.findOne({ where: { userId }, transaction: t });

    if (existingArtist) {
      if (existingArtist.status === ArtistStatus.PENDING) {
        throw new AppError('您的申请正在审核中，请耐心等待', 400, 400);
      }
      if (existingArtist.status === ArtistStatus.APPROVED) {
        throw new AppError('您已经是认证艺术家', 400, 400);
      }
      if (existingArtist.status === ArtistStatus.REJECTED) {
        throw new AppError('您的申请已被拒绝，请联系管理员', 400, 400);
      }
    }

    const artist = await Artist.create({
      userId,
      name,
      avatar,
      bio,
      specialties,
      style,
      representativeWorks: representativeWorks ? JSON.stringify(representativeWorks) : undefined,
      status: ArtistStatus.PENDING
    }, { transaction: t });

    await t.commit();
    res.status(201).json(ResponseUtil.success(artist, '申请提交成功，请等待审核'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getArtists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, keyword, specialties } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = ArtistStatus.APPROVED;
    }

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { bio: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (specialties) {
      where.specialties = { [Op.like]: `%${specialties}%` };
    }

    const { count, rows } = await Artist.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ],
      order: [['joinedAt', 'DESC NULLS LAST'], ['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Artist> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getArtistById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!artist) {
      throw new AppError('艺术家不存在', 404, 404);
    }

    const productCount = await Product.count({ where: { artistId: id, isActive: true } });
    
    const result = {
      ...artist.toJSON(),
      productCount
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getMyArtistProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const artist = await Artist.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 404, 404);
    }

    const productCount = await Product.count({ where: { artistId: artist.id } });
    const activeProductCount = await Product.count({ where: { artistId: artist.id, isActive: true } });

    const result = {
      ...artist.toJSON(),
      productCount,
      activeProductCount
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const reviewArtist = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const reviewerId = req.user!.userId;

    if (![ArtistStatus.APPROVED, ArtistStatus.REJECTED].includes(status)) {
      throw new AppError('无效的审核状态', 400, 400);
    }

    const artist = await Artist.findByPk(id, { transaction: t });

    if (!artist) {
      throw new AppError('艺术家不存在', 404, 404);
    }

    if (artist.status !== ArtistStatus.PENDING) {
      throw new AppError('该申请已被审核', 400, 400);
    }

    const updateData: any = {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    };

    if (status === ArtistStatus.APPROVED) {
      updateData.joinedAt = new Date();
      
      await User.update(
        { role: Role.MERCHANT },
        { where: { id: artist.userId }, transaction: t }
      );
    } else {
      updateData.rejectionReason = rejectionReason || '审核未通过';
    }

    await artist.update(updateData, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(artist, status === ArtistStatus.APPROVED ? '审核通过' : '审核拒绝'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateArtistProfile = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user!.userId;
    const { name, avatar, bio, specialties, style, representativeWorks } = req.body;

    const artist = await Artist.findOne({ where: { userId }, transaction: t });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 404, 404);
    }

    await artist.update({
      name,
      avatar,
      bio,
      specialties,
      style,
      representativeWorks: representativeWorks ? JSON.stringify(representativeWorks) : undefined
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(artist, '资料更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const suspendArtist = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { suspensionReason } = req.body;

    const artist = await Artist.findByPk(id, { transaction: t });

    if (!artist) {
      throw new AppError('艺术家不存在', 404, 404);
    }

    if (artist.status !== ArtistStatus.APPROVED) {
      throw new AppError('只能暂停已通过审核的艺术家', 400, 400);
    }

    await artist.update({
      status: ArtistStatus.SUSPENDED,
      rejectionReason: suspensionReason
    }, { transaction: t });

    await Product.update(
      { isActive: false },
      { where: { artistId: id }, transaction: t }
    );

    await User.update(
      { role: Role.USER },
      { where: { id: artist.userId }, transaction: t }
    );

    await t.commit();
    res.json(ResponseUtil.success(artist, '艺术家已暂停，相关商品已下架'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getPendingReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const { count, rows } = await Artist.findAndCountAll({
      where: { status: ArtistStatus.PENDING },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Artist> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getArtistStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findByPk(id);

    if (!artist) {
      throw new AppError('艺术家不存在', 404, 404);
    }

    const totalProducts = await Product.count({ where: { artistId: id } });
    const activeProducts = await Product.count({ where: { artistId: id, isActive: true } });
    const totalSales = await Product.sum('salesCount', { where: { artistId: id } }) || 0;

    res.json(ResponseUtil.success({
      totalProducts,
      activeProducts,
      totalSales,
      status: artist.status,
      joinedAt: artist.joinedAt,
      createdAt: artist.createdAt
    }));
  } catch (error) {
    next(error);
  }
};
