import { Request, Response, NextFunction } from 'express';
import { createOperationLog } from '../services/logService';
import { LogModule, LogAction } from '../types';

interface OperationLogOptions {
  module: LogModule | string;
  action: LogAction | string;
  getTargetId?: (req: Request, res: Response) => number | undefined;
  getDescription?: (req: Request, res: Response) => string | undefined;
  logRequestBody?: boolean;
  logResponseBody?: boolean;
}

export const operationLog = (options: OperationLogOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseBody: any;

    res.send = function(this: Response, body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    const finishLog = async () => {
      try {
        const targetId = options.getTargetId
          ? options.getTargetId(req, res)
          : req.params.id ? parseInt(req.params.id) : undefined;

        const description = options.getDescription
          ? options.getDescription(req, res)
          : undefined;

        let oldData: any = undefined;
        let newData: any = undefined;

        if (options.logRequestBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
          newData = req.body;
        }

        if (options.logResponseBody && responseBody) {
          try {
            newData = typeof responseBody === 'string'
              ? JSON.parse(responseBody)
              : responseBody;
          } catch {
            newData = responseBody;
          }
        }

        await createOperationLog(req, {
          module: options.module,
          action: options.action,
          targetId,
          targetType: options.module,
          oldData,
          newData,
          description
        });
      } catch (error) {
        console.error('Error in operation log middleware:', error);
      }
    };

    res.on('finish', finishLog);
    res.on('close', finishLog);

    next();
  };
};

export const createCourseCategoryLog = operationLog({
  module: LogModule.COURSE_CATEGORY,
  action: LogAction.CREATE,
  getTargetId: (req, res) => {
    try {
      const body = typeof res.send === 'function' ? undefined : res;
      return body?.data?.id;
    } catch {
      return undefined;
    }
  },
  logRequestBody: true
});

export const updateCourseCategoryLog = operationLog({
  module: LogModule.COURSE_CATEGORY,
  action: LogAction.UPDATE,
  getTargetId: (req) => parseInt(req.params.id),
  logRequestBody: true
});

export const deleteCourseCategoryLog = operationLog({
  module: LogModule.COURSE_CATEGORY,
  action: LogAction.DELETE,
  getTargetId: (req) => parseInt(req.params.id)
});

export const createTeacherLog = operationLog({
  module: LogModule.TEACHER,
  action: LogAction.CREATE,
  logRequestBody: true
});

export const updateTeacherLog = operationLog({
  module: LogModule.TEACHER,
  action: LogAction.UPDATE,
  getTargetId: (req) => parseInt(req.params.id),
  logRequestBody: true
});

export const deleteTeacherLog = operationLog({
  module: LogModule.TEACHER,
  action: LogAction.DELETE,
  getTargetId: (req) => parseInt(req.params.id)
});

export const createStudentLog = operationLog({
  module: LogModule.STUDENT,
  action: LogAction.CREATE,
  logRequestBody: true
});

export const updateStudentLog = operationLog({
  module: LogModule.STUDENT,
  action: LogAction.UPDATE,
  getTargetId: (req) => parseInt(req.params.id),
  logRequestBody: true
});

export const deleteStudentLog = operationLog({
  module: LogModule.STUDENT,
  action: LogAction.DELETE,
  getTargetId: (req) => parseInt(req.params.id)
});

export const enrollStudentLog = operationLog({
  module: LogModule.ENROLLMENT,
  action: LogAction.ENROLL,
  logRequestBody: true
});

export const approveEnrollmentLog = operationLog({
  module: LogModule.ENROLLMENT,
  action: LogAction.APPROVE,
  getTargetId: (req) => parseInt(req.params.id)
});

export const rejectEnrollmentLog = operationLog({
  module: LogModule.ENROLLMENT,
  action: LogAction.REJECT,
  getTargetId: (req) => parseInt(req.params.id)
});

export const createClassLog = operationLog({
  module: LogModule.CLASS,
  action: LogAction.CREATE,
  logRequestBody: true
});

export const updateClassLog = operationLog({
  module: LogModule.CLASS,
  action: LogAction.UPDATE,
  getTargetId: (req) => parseInt(req.params.id),
  logRequestBody: true
});

export const deleteClassLog = operationLog({
  module: LogModule.CLASS,
  action: LogAction.DELETE,
  getTargetId: (req) => parseInt(req.params.id)
});

export const recordAttendanceLog = operationLog({
  module: LogModule.ATTENDANCE,
  action: LogAction.ATTENDANCE,
  logRequestBody: true
});
