import React from 'react';

const ConfirmModal = ({ show, title = 'Are you sure?', message = 'This action cannot be undone.', onConfirm, onCancel, confirmLabel = 'Remove' }) => {
  if (!show) return null;
  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(33,24,17,.45)' }} onClick={onCancel}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content ad-confirm-modal">
            <div className="modal-body text-center">
              <div className="ad-confirm-icon"><i className="bi bi-trash3"></i></div>
              <h5>{title}</h5>
              <p className="ad-confirm-msg text-muted mb-0">{message}</p>
            </div>
            <div className="modal-footer justify-content-center border-0">
              <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}><i className="bi bi-trash me-1"></i>{confirmLabel}</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ConfirmModal;
