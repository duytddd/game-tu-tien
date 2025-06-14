// src/lib/utils/ErrorHandler.ts
// Đây là một module không phải React Hook.

//import type { HttpsError } from "firebase-functions/v2/https"; // Import type nếu có

class AppErrorHandler {
  private _showToast: ((message: string, type?: 'info' | 'success' | 'error' | 'warning') => void) | null = null;

  public init(showToastFunc: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void) {
    this._showToast = showToastFunc;
  }

  public showError(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'error') {
    if (this._showToast) {
      this._showToast(message, type);
    } else {
      console.error("Toast handler not initialized:", message);
      alert(message); // Fallback nếu showToast chưa được set
    }
  }

  public handleFirebaseError(error: any, context: string = '') {
    console.error(`[${context}] Firebase Error:`, error);
    
    let userMessage = 'Đã xảy ra lỗi kết nối Firebase. Vui lòng thử lại sau.';
    
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          userMessage = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        case 'not-found':
          userMessage = 'Không tìm thấy dữ liệu hoặc mục tiêu.';
          break;
        case 'already-exists':
          userMessage = 'Dữ liệu đã tồn tại hoặc bạn đã làm điều này rồi.';
          break;
        case 'unauthenticated':
          userMessage = 'Vui lòng đăng nhập để tiếp tục.';
          break;
        case 'invalid-argument':
          userMessage = error.message || 'Dữ liệu đầu vào không hợp lệ.';
          break;
        case 'failed-precondition':
          userMessage = error.message || 'Điều kiện không thỏa mãn để thực hiện hành động.';
          break;
        default:
          userMessage = error.message || `Lỗi không xác định: ${error.code}`;
          break;
      }
    } else if (error.message) {
      userMessage = error.message;
    }
    
    this.showError(userMessage, 'error');
  }

  public handleError(error: any, context: string = '') {
    console.error(`[${context}] Error:`, error);
    let userMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
    if (error.message && !error.message.includes('internal')) {
      userMessage = error.message;
    }
    this.showError(userMessage, 'error');
  }
}

export const ErrorHandler = new AppErrorHandler();