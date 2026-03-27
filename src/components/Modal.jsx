function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="section-card w-full max-w-xl p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-slate-400"><i className="fa-solid fa-xmark text-xl" /></button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
