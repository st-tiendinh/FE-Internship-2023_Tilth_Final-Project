import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiService } from '../../../../core/services/api.service';
import JwtHelper from '../../../../core/helpers/jwtHelper';
import { ENDPOINT } from '../../../../../config/endpoint';
import { PostStatus } from '../../../user/containers/UserDetail';
import BlankPostImg from '../../../../../assets/images/blank-post.png';
import {
  TypeUpload,
  UploadImageService,
} from '../../../../core/services/uploadImage.service';

import { isImageUrlValid } from '../../../../shared/utils/checkValidImage';
import { ToggleButton } from '../../../../shared/components';

const apiService = new ApiService();
const jwt = new JwtHelper();

export enum PostAction {
  CREATE = 'create',
  UPDATE = 'update',
}

interface ArticleEditorProps {
  type: PostAction;
  data?: any;
}

export const ArticleEditor = ({ type, data }: ArticleEditorProps) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [titleInput, setTitleInput] = useState<string>(
    type === PostAction.UPDATE ? data.title : ''
  );
  const [titleValue, setTitleValue] = useState<string>('');
  const [descInput, setDescInput] = useState<string>(
    type === PostAction.UPDATE ? data.description : ''
  );
  const [descValue, setDescValue] = useState<string>('');
  const [tagItems, setTagItems] = useState<string[]>(
    type === PostAction.UPDATE ? data.tags : []
  );
  const [tagItemValue, SetTagItemValue] = useState('');
  const [contentValue, setContentValue] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(
    type === PostAction.UPDATE
      ? data.status === PostStatus.PUBLIC
        ? true
        : false
      : true
  );

  const [imageUrl, setImageUrl] = useState<string | undefined>(
    type === PostAction.UPDATE ? data.cover : undefined
  );

  const [imageFile, setImageFile] = useState<any>(null);
  const [isValidCover, setIsValidCover] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const tagInputRef = useRef<any>(null);
  const titleInputRef = useRef<any>(null);
  const descInputRef = useRef<any>(null);

  useEffect(() => {
    if (type === PostAction.UPDATE) {
      isImageUrlValid(data.cover).then((isValid) => {
        isValid ? setIsValidCover(true) : setIsValidCover(false);
      });
    }
  }, [isValidCover, data?.cover]);

  const handleImage = (file: File | null) => {
    if (file) {
      setImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImage(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    handleImage(file);
  };

  const handleImageClick = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleChangeTitle = () => {
    setTitleInput(titleInputRef.current.value);
  };

  const handleChangeDesc = () => {
    setDescInput(descInputRef.current.value);
  };

  const handleSubmitTitle = () => {
    if (titleInputRef.current.value.trim()) {
      setTitleValue(titleInputRef.current.value);
    }
  };

  const handleSubmitDesc = () => {
    if (descInputRef.current.value.trim()) {
      setDescValue(descInputRef.current.value.trim());
    }
  };

  const handleTagChange = () => {
    SetTagItemValue(tagInputRef.current.value);
  };

  const handleTagEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.key === 'Enter') {
      if (tagInputRef.current.value.trim()) {
        setTagItems((prev) => [...prev, tagInputRef.current.value.trim()]);
        SetTagItemValue('');
      }
    }
  };

  const handleDeleteTagItem = (id: number) => {
    setTagItems(
      tagItems.filter((_, index) => {
        return index !== id;
      })
    );
  };

  const handleUploadImage = async (typeUpload: TypeUpload) => {
    const uploadImgService = new UploadImageService(apiService, jwt);
    if (imageFile) {
      const fileName = imageFile.name.split('.').shift();
      const url: string = await uploadImgService.uploadImage(
        typeUpload,
        fileName,
        'image/jpg',
        imageFile
      );
      setImageUrl(url);
      return url;
    }
    return imageUrl;
  };

  const handleSubmitData = () => {
    (async () => {
      try {
        setIsLoading(true);
        const url = await handleUploadImage(TypeUpload.COVER_POST);
        const postData = {
          title: titleValue,
          cover: url,
          content: contentValue,
          status: isPublic ? PostStatus.PUBLIC : PostStatus.PRIVATE,
          description: descValue,
          tags: tagItems,
        };
        apiService.setHeaders(jwt.getAuthHeader());
        await apiService.post([ENDPOINT.posts.index], postData);
        setIsLoading(false);
        navigate('/');
      } catch (error: any) {
        setError(error.response.data.errors[0]);
        window.scrollTo(0, 0);
        setIsLoading(false);
      }
    })();
  };

  const handleUpdateData = () => {
    (async () => {
      try {
        const url = await handleUploadImage(TypeUpload.COVER_POST);
        const postUpdated = {
          title: titleValue,
          cover: url,
          content: contentValue,
          status: isPublic ? PostStatus.PUBLIC : PostStatus.PRIVATE,
          description: descValue,
          tags: tagItems,
        };
        apiService.setHeaders(jwt.getAuthHeader());
        await apiService.put(
          [ENDPOINT.posts.index, `${location.pathname.split('/').pop()}`],
          postUpdated
        );
        navigate(-1);
      } catch (error) {
        console.log(error);
      }
    })();
  };

  function uploadAdapter(loader: any) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          let signUrl: any;
          let imgUrl: any;
          loader.file.then((file: any) => {
            const filenameParts = file?.name.split('.');
            const firstNameElement = filenameParts?.shift();
            const params = `?type_upload=content-post&file_name=${firstNameElement}&file_type=image/png}`;
            apiService.setHeaders(jwt.getAuthHeader());
            apiService
              .get([ENDPOINT.signatures.index, `${params}`])
              .then((res: any) => {
                signUrl = res.signedRequest;
                imgUrl = res.url;
              })
              .then(() =>
                axios.put(signUrl, file).then((err) => console.log(err))
              )
              .then(() => resolve({ default: imgUrl }))
              .catch((err) => reject(err));
          });
        });
      },
    };
  }

  function uploadPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return uploadAdapter(loader);
    };
  }

  console.log(imageFile && URL.createObjectURL(imageFile));

  return (
    <div className="article-editor">
      {!!error && (
        <div className="article-editor-error-wrapper">
          <h3 className="article-editor-error-title">
            Whoops, something went wrong:
          </h3>
          <p className="article-editor-error-message">{error}</p>
        </div>
      )}
      <div className="article-editor-form">
        <div
          className="article-editor-drop-zone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            id="file-input"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
          {imageFile && type === PostAction.CREATE ? (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Uploaded"
              onClick={handleImageClick}
              className="article-editor-image"
            />
          ) : (
            ''
          )}
          {imageUrl ? (
            imageFile ? (
              <img
                src={
                  type === PostAction.UPDATE
                    ? URL.createObjectURL(imageFile)
                    : imageUrl
                }
                alt="Uploaded"
                onClick={handleImageClick}
                className="article-editor-image"
              />
            ) : (
              <img
                src={
                  type === PostAction.UPDATE
                    ? isValidCover
                      ? imageUrl
                      : BlankPostImg
                    : URL.createObjectURL(imageFile)
                }
                alt="Uploaded"
                onClick={handleImageClick}
                className="article-editor-image"
              />
            )
          ) : null}
          {!imageFile && !imageUrl ? (
            <p onClick={handleImageClick}>
              Drag and drop photo here or click to select photo
            </p>
          ) : (
            ''
          )}
        </div>

        <textarea
          className="article-editor-title-input"
          value={titleInput}
          placeholder="New post title here..."
          ref={titleInputRef}
          onChange={handleChangeTitle}
          onBlur={handleSubmitTitle}
        ></textarea>

        <textarea
          className="article-editor-desc-input"
          placeholder="Enter post description..."
          value={descInput}
          onChange={handleChangeDesc}
          ref={descInputRef}
          onBlur={handleSubmitDesc}
        ></textarea>

        <div className="article-editor-tags-search-group">
          {tagItems.length < 4 && (
            <input
              type="text"
              className="article-editor-tags-search"
              placeholder="Add up to 4 tags..."
              value={tagItemValue}
              ref={tagInputRef}
              onChange={handleTagChange}
              onKeyUp={handleTagEnter}
              onSubmit={(e) => e.preventDefault()}
            />
          )}

          <ul className="article-editor-tag-list">
            {tagItems.map((item, index) => (
              <li
                key={index}
                className="article-editor-tag-item"
                onClick={() => handleDeleteTagItem(index)}
              >
                <span className="badge badge-primary text-truncate">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <CKEditor
          editor={ClassicEditor}
          config={{
            extraPlugins: [uploadPlugin],
            placeholder: 'Write your post here...',
          }}
          data={type === PostAction.CREATE ? '' : data.content}
          onBlur={(_, editor) => {
            setContentValue(editor.getData());
          }}
        />
        <div className="article-editor-form-action">
          <div className="article-editor-post-status">
            <ToggleButton isPublic={isPublic} setIsPublic={setIsPublic} />
          </div>
          <button
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            onClick={
              type === PostAction.CREATE ? handleSubmitData : handleUpdateData
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
