import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';

import {
  useForm,
  SubmitHandler,
  useFieldArray,
  Controller,
} from 'react-hook-form';
import { Loading } from '../../components/Loading';
import { IProduct, IProducts } from '../../types/Product';
import { toast } from 'react-toastify';
import { IProductSku } from '../../types/ProductSku';
import { Helmet } from 'react-helmet-async';
import { api } from '../../api/api';

import { Input } from '../../components/Input';

export function ProductSkusForm() {
  const { id: productId } = useParams<{ [key: string]: '' }>();

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IProduct>({
    defaultValues: {} as IProduct,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skus',
    keyName: '_id',
  });

  const [{ product, loading }, fetch] = useState<IProducts<IProduct>>({
    product: {} as IProduct,
    loading: true,
    error: '',
  });

  const fetchApi = useCallback(async (productId: string) => {
    await api.get(`/products/${productId}/skus`).then(async ({ data }) => {
      fetch({
        product: await data,
        loading: false,
        error: '',
      });
      reset(await data);
    });
  }, []);

  useEffect(() => {
    if (productId) fetchApi(productId);
  }, [productId]);

  useEffect(() => {
    const url = pathname.split('/');
    if (product.id && url[url.length - 1] === 'new') {
      navigate(`/products/${product.id}/skus`);
    }
  }, [product]);

  const onSubmit: SubmitHandler<IProduct> = async data => {
    let promiseProduct;
    const skusList = data?.skus ?? [];
    // eslint-disable-next-line prefer-const
    promiseProduct = (async () => {
      for (const {
        id,
        product_id,
        cost_price,
        price,
        quantity,
        sale_price,
        sku,
      } of skusList) {
        const newData = {
          price,
          cost_price,
          sale_price,
          quantity,
          sku,
        };

        if (product_id && id) {
          await api.put(`/products/${product_id}/skus/${id}`, newData);
        } else {
          await api.post(`/products/${productId}/skus`, newData);
        }
      }

      if (productId) await fetchApi(productId);
    })();

    toast.promise(promiseProduct, {
      pending: 'Um momento por favor...',
      success: 'Dados salvos com sucesso!',
      error: 'Algo deu errado, tente novamente!',
    });
  };

  const resolveDelete = async ({ id, product_id, sku }: IProductSku) => {
    if (!confirm(`Deseja realmente excluir ${sku}!`)) return;

    toast.promise(
      api.delete(`/products/${product_id}/skus/${id}`).then(() => {
        const index = product.skus?.findIndex(obj => obj.id === id, id);
        remove(index);
      }),
      {
        pending: 'Um momento por favor...',
        success: 'Removido com sucesso!',
        error: 'Algo deu errado, tente novamente!',
      },
    );
  };

  return (
    <div className="content">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="help-buttons-flex">
            <h1>{product?.name}</h1>
            <span>
              <Link
                to={`/products/${product.id}/edit`}
                className="btn btn-default"
              >
                voltar <i className="fa-solid fa-undo"></i>
              </Link>

              <button
                type="button"
                className="btn btn-info"
                onClick={() => append({} as IProductSku)}
              >
                adicionar <i className="fa-solid fa-plus"></i>
              </button>

              <button
                type="submit"
                form="products-skus"
                className="btn btn-primary"
              >
                salvar <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </span>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="form-style"
            id="products-skus"
          >
            {fields.map((field, index) => (
              <div
                className="flex flex-4 flex-xs-12 flex-wrap aling-end"
                key={field._id}
                style={{
                  borderBottom: 'solid 1px #f1f1f1',
                  padding: '0 0 16px 0',
                }}
              >
                <div className="flex-12">
                  <span
                    onClick={() => resolveDelete(field)}
                    className="btn btn-danger"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </span>
                  <Link
                    to={`/products/${product.id}/skus/${field.id}/images`}
                    className="btn btn-primary"
                  >
                    <i className="fa-solid fa-photo-film"></i>
                  </Link>
                </div>
                <div className="form-input flex-1-1">
                  <label htmlFor="sku">SKU *</label>
                  <input
                    type="text"
                    id={`${field._id}-sku`}
                    className={errors.skus?.[index]?.sku && 'input-invalid'}
                    {...register(`skus.${index}.sku`, {
                      required: 'Campo obrigatório!',
                    })}
                  />
                  <small>
                    {errors.skus && errors.skus?.[index]?.sku?.message}
                  </small>
                </div>
                <div className="form-input flex-1">
                  <label htmlFor="sku">Preço Custo *</label>
                  <Controller
                    control={control}
                    name={`skus.${index}.cost_price`}
                    render={({ field: { onChange, value } }) => (
                      <input
                        type="tel"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className={
                          errors.skus?.[index]?.cost_price && 'input-invalid'
                        }
                      />
                    )}
                  />
                  <small>
                    {errors.skus && errors.skus?.[index]?.cost_price?.message}
                  </small>
                </div>
                <div className="form-input flex-1">
                  <label htmlFor="sku">Preço Venda *</label>
                  <input
                    type="tel"
                    id={`${field._id}-sale`}
                    className={
                      errors.skus?.[index]?.sale_price && 'input-invalid'
                    }
                    {...register(`skus.${index}.sale_price`, {
                      required: 'Campo obrigatório!',
                    })}
                  />
                  <small>
                    {errors.skus && errors.skus?.[index]?.sale_price?.message}
                  </small>
                </div>
                <div className="form-input flex-1">
                  <label htmlFor="sku">Preço *</label>
                  <input
                    type="tel"
                    id={`${field._id}-price`}
                    className={errors.skus?.[index]?.price && 'input-invalid'}
                    {...register(`skus.${index}.price`, {
                      required: 'Campo obrigatório!',
                    })}
                  />
                  <small>
                    {errors.skus && errors.skus?.[index]?.price?.message}
                  </small>
                </div>

                {/* <Input
                  label="Estoque *"
                  id={`${field._id}-quantity`}
                  className={`flex-1 ${
                    errors.skus?.[index]?.quantity && 'input-invalid'
                  }`}
                  {...register(`skus.${index}.quantity`, {
                    required: 'Campo obrigatório!',
                  })}
                >
                  <small>
                    {errors.skus && errors.skus?.[index]?.quantity?.message}
                  </small>
                </Input> */}

                <div className="form-input flex-1">
                  <label htmlFor="sku">Estoque *</label>
                  <input
                    type="text"
                    id={`${field._id}-quantity`}
                    {...register(`skus.${index}.quantity`, {
                      required: 'Campo obrigatório!',
                    })}
                    className={
                      errors.skus?.[index]?.quantity && 'input-invalid'
                    }
                  />
                  <small>
                    {errors.skus && errors.skus?.[index]?.quantity?.message}
                  </small>
                </div>
              </div>
            ))}
          </form>
        </>
      )}
      <Helmet>
        <title>Produtos/Skus - Editar/Cadastrar</title>
      </Helmet>
    </div>
  );
}
