/**
 * 飞书多维表格(Bitable) API接口
 * 提供与飞书多维表格交互的功能
 */

import { bitable } from '@lark-base-open/js-sdk';

// 飞书多维表格接口定义
export interface IBitableBase {
  getFieldValue: (recordId: string, fieldId: string) => Promise<any>;
  setFieldValue: (recordId: string, fieldId: string, value: any) => Promise<void>;
}

export interface IBitable {
  base: IBitableBase;
  ui?: any;
}

/**
 * 多维表格字段扩展参数接口
 */
export interface IFieldExtensionArgs {
  dom: HTMLElement | null;
  cellValue: any;
  recordId: string;
  fieldId: string;
  [key: string]: any;
}

/**
 * 多维表格扩展初始化参数接口
 */
export interface IExtensionInitArgs {
  bitable: any;
  [key: string]: any;
}

/**
 * 多维表格扩展接口
 */
export interface IBitableExtension {
  name: string;
  version: string;
  type: 'field';
  fieldType: string;
  onInitialized: (args: IExtensionInitArgs) => void;
  onRenderedCell: (args: IFieldExtensionArgs) => boolean;
  onRenderedEditor: (args: IFieldExtensionArgs) => void;
}

// 获取值辅助函数 - 带缓存功能
const valueCache = new Map<string, string>();

/**
 * 从多维表格获取单元格数据
 * @param recordId 记录ID
 * @param fieldId 字段ID
 * @returns 单元格数据
 */
export const getCellValue = async (recordId: string, fieldId: string) => {
  try {
    const selection = await bitable.base.getSelection();
    if (!selection) {
      throw new Error('未获取到表格选择信息');
    }

    const tableId = selection.tableId;
    if (!tableId) {
      throw new Error('选择信息中不包含表格ID');
    }

    const table = await bitable.base.getTableById(tableId);
    if (!table) {
      throw new Error(`未找到表格: tableId=${tableId}`);
    }

    const cellValue = await table.getCellValue(fieldId, recordId);
    const processedValue = cellValue || '';
    return processedValue;
  } catch (error) {
    throw error;
  }
};

// 清除缓存
export const clearCellValueCache = (recordId?: string, fieldId?: string) => {
  if (recordId && fieldId) {
    // 清除特定单元格的缓存
    valueCache.delete(`${recordId}:${fieldId}`);
  } else {
    // 清除所有缓存
    valueCache.clear();
  }
};

/**
 * 保存单元格数据到多维表格
 * @param recordId 记录ID
 * @param fieldId 字段ID
 * @param value 要保存的数据
 */
export const setCellValue = async (recordId: string, fieldId: string, value: any) => {
  try {
    const selection = await bitable.base.getSelection();
    if (!selection) {
      throw new Error('未获取到表格选择信息');
    }

    const tableId = selection.tableId;
    if (!tableId) {
      throw new Error('选择信息中不包含表格ID');
    }

    const table = await bitable.base.getTableById(tableId);
    if (!table) {
      throw new Error(`未找到表格: tableId=${tableId}`);
    }

    await table.setCellValue(fieldId, recordId, value);
  } catch (error) {
    throw error;
  }
};

// 添加bitable类型扩展
declare global {
  interface Window {
    bitable: {
      base?: any;
      registerFieldExtension: (config: any) => void;
      [key: string]: any;
    };
  }
}

/**
 * 检测是否在飞书多维表格环境中运行
 * @returns 是否在多维表格环境中
 */
export const isInBitableEnvironment = async () => {
  try {
    const hasBitableGlobal = typeof bitable !== 'undefined';
    const url = window.location.href;
    const isFeishuUrl = url.includes('feishu.cn') || url.includes('larksuite.com');
    const isBitableUrl = url.includes('base.feishu.cn') || url.includes('base.larksuite.com');
    
    let isInFeishuIframe = false;
    try {
      isInFeishuIframe = window.self !== window.top;
    } catch (e) {
      isInFeishuIframe = true;
    }
    
    const larkSDKAvailable = hasBitableGlobal && typeof bitable.base !== 'undefined';
    
    const result = {
      hasBitableGlobal,
      isFeishuUrl,
      isBitableUrl,
      isInFeishuIframe,
      larkSDKAvailable
    };
    
    return result.larkSDKAvailable;
  } catch (error) {
    return false;
  }
};

/**
 * 检测是否可以使用多维表格扩展API
 * @returns 是否可以使用扩展API
 */
export function canUseExtensionAPI(): boolean {
  try {
    // 检查飞书多维表格扩展API是否可用
    const bitable = (window as any).bitable;
    return typeof bitable === 'object' && 
           typeof bitable.ui === 'object' && 
           typeof bitable.ui.registerField === 'function';
  } catch (error) {
    console.warn('检测多维表格扩展API失败:', error);
    return false;
  }
}

/**
 * 注册一个多维表格字段扩展，自动处理错误
 * @param extension 扩展配置
 * @returns 是否注册成功
 */
export function registerBitableExtension(extension: IBitableExtension): boolean {
  try {
    console.log('[扩展注册] 尝试注册扩展:', extension.name);
    
    // 确保全局环境正确
    if (typeof window === 'undefined') {
      throw new Error('非浏览器环境，无法注册扩展');
    }
    
    if (!window.bitable) {
      console.warn('[扩展注册] 警告: 全局bitable对象不存在');
      // 创建一个模拟对象用于开发环境
      window.bitable = {
        registerFieldExtension: (config: any) => {
          console.log('[扩展注册][模拟] 字段扩展注册成功:', config);
        }
      };
    }
    
    // 检查API是否可用
    if (!window.bitable.registerFieldExtension) {
      console.error('[扩展注册] bitable.registerFieldExtension API不可用');
      throw new Error('bitable.registerFieldExtension API不可用');
    }
    
    // 注册扩展
    console.log('[扩展注册] 正在注册字段扩展...');
    window.bitable.registerFieldExtension({
      type: extension.type,
      fieldType: extension.fieldType,
      name: extension.name,
      version: extension.version,
      
      onInitialized: (args: IExtensionInitArgs) => {
        console.log(`[扩展注册] 扩展 ${extension.name} 初始化中...`);
        try {
          extension.onInitialized(args);
          console.log(`[扩展注册] 扩展 ${extension.name} 初始化成功`);
        } catch (error) {
          console.error(`[扩展注册] 扩展 ${extension.name} 初始化失败:`, error);
        }
      },
      
      onRenderedCell: (args: IFieldExtensionArgs) => {
        try {
          const result = extension.onRenderedCell(args);
          console.log(`[扩展注册] 扩展 ${extension.name} 渲染单元格, 结果:`, result);
          return result;
        } catch (error) {
          console.error(`[扩展注册] 扩展 ${extension.name} 渲染单元格失败:`, error);
          return false;
        }
      },
      
      onRenderedEditor: (args: IFieldExtensionArgs) => {
        try {
          console.log(`[扩展注册] 扩展 ${extension.name} 渲染编辑器开始, recordId=${args.recordId}, fieldId=${args.fieldId}`);
          extension.onRenderedEditor(args);
          console.log(`[扩展注册] 扩展 ${extension.name} 渲染编辑器完成`);
        } catch (error) {
          console.error(`[扩展注册] 扩展 ${extension.name} 渲染编辑器失败:`, error);
        }
      }
    });
    
    console.log(`[扩展注册] 扩展 ${extension.name} 注册完成`);
    return true;
  } catch (error) {
    console.error('[扩展注册] 注册扩展失败:', error);
    return false;
  }
}

/**
 * 初始化飞书多维表格扩展
 * @returns 初始化是否成功
 */
export function initBitableExtension(): boolean {
  try {
    console.log('[扩展初始化] 开始初始化多维表格扩展...');
    
    // 确保全局环境正确
    if (typeof window === 'undefined') {
      throw new Error('非浏览器环境，无法初始化扩展');
    }
    
    // 在开发环境中模拟 bitable 对象
    if (!window.bitable) {
      console.log('[扩展初始化] 在开发环境中模拟 bitable 对象');
      window.bitable = {
        base: {
          getSelection: () => Promise.resolve({ tableId: 'mock-table-id' }),
          getTableById: () => Promise.resolve({
            getCellValue: () => Promise.resolve(''),
            setCellValue: () => Promise.resolve()
          })
        },
        registerFieldExtension: (config: any) => {
          console.log('[扩展初始化][开发环境] 注册字段扩展:', config);
          // 立即调用初始化回调
          if (config.onInitialized) {
            config.onInitialized({ bitable: window.bitable });
          }
        }
      };
    }
    
    // 检查必要的API是否可用
    if (typeof window.bitable.registerFieldExtension !== 'function') {
      console.error('[扩展初始化] bitable.registerFieldExtension API不可用');
      return false;
    }
    
    // 注册字段扩展
    console.log('[扩展初始化] 正在注册字段扩展...');
    window.bitable.registerFieldExtension({
      type: 'field',
      name: 'markdown-helper',
      version: '1.0.0',
      fieldType: 'Text',
      onInitialized: (args: IExtensionInitArgs) => {
        console.log('[扩展初始化] 扩展初始化完成，参数:', args);
      },
      onRenderedCell: (args: IFieldExtensionArgs) => {
        console.log('[扩展初始化] 单元格渲染完成，参数:', args);
        return true;
      },
      onRenderedEditor: (args: IFieldExtensionArgs) => {
        console.log('[扩展初始化] 编辑器渲染完成，参数:', args);
      }
    });
    
    console.log('[扩展初始化] 多维表格扩展注册成功');
    return true;
  } catch (error) {
    console.error('[扩展初始化] 初始化多维表格扩展失败:', error);
    return false;
  }
}

export default {
  getCellValue,
  setCellValue,
  clearCellValueCache,
  registerBitableExtension,
  isInBitableEnvironment
}; 