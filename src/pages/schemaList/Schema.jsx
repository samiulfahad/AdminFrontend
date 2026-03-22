import { Link } from "react-router-dom";
import { Eye, Pencil, PowerOff, Power, Trash2 } from "lucide-react";

const Schema = ({ input, index, onDelete, onActivate, onDeactivate, onSetDefault }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 my-3 hover:shadow-md transition-all duration-300 group">
      {/* Mobile Compact View */}
      <div className="sm:hidden">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">S{index + 1}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{input.name}</h3>
              {input.testName && <p className="text-xs text-gray-500 mt-0.5">{input.testName}</p>}
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              input.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${input.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
            {input.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Structure Info */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <svg
            className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-gray-600">
            {input.fields?.length || 0} fields
            {input.sections && `, ${input.sections.length} sections`}
          </span>
        </div>

        {/* Mobile Actions */}
        <div className="flex gap-2 mt-3">
          <Link
            to={`/render-schema/${input._id}`}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>Render Form</span>
          </Link>
          <Link
            to={`/schema-builder/${input._id}`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-2"
            title="Edit Schema"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2 mt-2">
          {input.isActive ? (
            <button
              onClick={onDeactivate}
              className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-amber-600 text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              title="Deactivate Schema"
            >
              <PowerOff className="w-4 h-4" />
              <span>Deactivate</span>
            </button>
          ) : (
            <button
              onClick={onActivate}
              className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg text-emerald-600 text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              title="Activate Schema"
            >
              <Power className="w-4 h-4" />
              <span>Activate</span>
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-red-600 text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            title="Delete Schema"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex sm:flex-row sm:items-center gap-4">
        {/* Schema Identity */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S{index + 1}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{input.name}</h3>
            {input.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{input.description}</p>}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center">
          <span
            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
              input.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${input.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
            {input.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <Link
            to={`/render-schema/${input._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            title="Render Form"
          >
            <Eye className="w-4 h-4" />
          </Link>

          <Link
            to={`/schema-builder/${input._id}`}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Edit Schema"
          >
            <Pencil className="w-4 h-4" />
          </Link>

          {input.isActive ? (
            <button
              onClick={onDeactivate}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              title="Deactivate Schema"
            >
              <PowerOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onActivate}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              title="Activate Schema"
            >
              <Power className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onDelete}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            title="Delete Schema"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schema;
